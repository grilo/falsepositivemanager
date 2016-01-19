import logging
import traceback
import os
import hashlib
import shutil
import json
import tempfile
import collections

import task


class OWASP:

    def __init__(self, dao):
        self.dao = dao
        self.__tasks = {}
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")

    def scan(self, filename):
        # Generate a Unique IDentifier
        with open(filename, 'rb') as f:
            task_id = hashlib.sha1(f.read()).hexdigest()
            if self.dao.project_exists(task_id):
                logging.debug("File already processed (%s %s)" % (task_id, filename))
                return
            # Copy the file to a temporary location
            directory = tempfile.mkdtemp()
            filename_only = os.path.basename(filename)
            shutil.copyfile(filename, os.path.join(directory, filename_only))

            # Start the scanning process
            self.__tasks[task_id] = task.OWASP(filename_only, directory, self.binary)
            self.__tasks[task_id].start()

    def __refresh_state(self):
        # Ensure our cachedir is fresh with the latest results
        # Also, garbage collect what we don't need
        to_delete = []
        for task_id, task in self.__tasks.items():
            # Is the task done?
            if not task.is_finished(): continue

            if task.get_returncode() == 0:
                try:
                    report = task.get_report()
                except FileNotFoundError:
                    e = traceback.format_exc()
                    logging.error("Report file is missing! id (%s) cmd (%s) ex (%s)" % (task_id, task.command, e))
                    logging.warning("I will delete the reference to task_id (%s). This should be resubmitted.")
                    del self.__tasks[task_id]
                    continue
                except AttributeError:
                    e = traceback.format_exc()
                    logging.error("Report file doesn't have all the required fields: id (%s) cmd (%s) ex (%s)" % (task_id, task.command, e))
                    continue

                if self.dao.project_exists(task_id):
                    self.dao.delete_project(task_id)
                self.dao.create_project(id=task_id, name=report["name"], date=report["date"])
                for k, v in report["dependencies"].items():
                    d = self.dao.create_dependency(project=task_id, checksum=k, name=v["name"])
                    for vulnerability in v["vulnerabilities"]:
                        vulnerability["dependency"] = d.id
                        self.dao.create_vulnerability(vulnerability)
            else:
                logging.error("Error executing the task! id (%s) cmd (%s) ex (%s)" % (task_id, task.command, e))
            logging.info("Removing temporary directory (%s) used for the task (%s)" % (task.directory, task.name))
            shutil.rmtree(task.directory)
            to_delete.append(task_id)

        for task_id in to_delete:
            del self.__tasks[task_id]

    def get_running(self):
        self.__refresh_state()
        running = []
        for task_id, task in self.__tasks.items():
            running.append({
                'project_id': task_id, 
                'project': task.name,
            })
        return running

    def cancel_running(self, project_id):
        for task_id, task in self.__tasks.items():
            if project_id == task_id:
                task.kill()
        del self.__tasks[project_id]
        return True
