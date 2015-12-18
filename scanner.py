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

    def __init__(self, storage, fp, schema='owasp'):
        self.storage = storage
        self.schema = schema
        self.fp = fp
        self.__tasks = {}
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")
        if not self.schema in self.storage.keys():
            self.storage[self.schema] = {
                'projects': {},
                'dependencies': {},
            }

    def scan(self, filename):
        # Generate a Unique IDentifier
        with open(filename, 'rb') as f:
            task_id = hashlib.sha1(f.read()).hexdigest()
            # Don't bother if the item was previously scanned
            if task_id in self.storage[self.schema]['projects'].keys():
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
                    self.storage[self.schema]['projects'][task_id] = report
                    for d in report['dependencies'].keys():
                        self.storage[self.schema]['dependencies'][d] = report['dependencies'][d]
                except FileNotFoundError:
                    e = traceback.format_exc()
                    logging.error("Report file is missing! id (%s) cmd (%s) ex (%s)" % (task_id, task.command, e))
                    logging.warning("I will delete the reference to task_id (%s). This should be resubmitted.")
                    del self.__tasks[task_id]
                except AttributeError:
                    e = traceback.format_exc()
                    logging.error("Report file doesn't have all the required fields: id (%s) cmd (%s) ex (%s)" % (task_id, task.command, e))
            else:
                logging.error("Error executing the task! id (%s) cmd (%s) ex (%s)" % (task_id, task.command, e))
            logging.info("Removing temporary directory (%s) used for the task (%s)" % (task.directory, task.name))
            shutil.rmtree(task.directory)
            to_delete.append(task_id)

        self.rescan_falsepositives()

        for task_id in to_delete:
            del self.__tasks[task_id]

    def rescan_falsepositives(self):
        for project_id, project in self.storage[self.schema]['projects'].items():
            for dependency_id, dependency in project['dependencies'].items():
                for vuln in dependency['vulnerabilities']:
                    vuln['falsepositive'] = self.fp.is_false_positive(project_id, dependency_id, vuln['cve'])

    def get_running(self):
        self.__refresh_state()
        running = []
        for task_id, task in self.__tasks.items():
            running.append({
                'project_id': task_id, 
                'project': task.name,
            })
        return running

    def get_projects(self):
        self.__refresh_state()
        projects = []
        for p in self.storage[self.schema]['projects'].keys():
            projects.append({
                'project_id': p,
                'name': self.storage[self.schema]['projects'][p]['name'],
            })
        return self.storage[self.schema]['projects']

    def get_project(self, project_id):
        self.__refresh_state()
        return self.storage[self.schema]['projects'][project_id]

    def get_project_dependencies(self, project_id):
        self.__refresh_state()
        return self.storage[self.schema]['projects'][project_id]['dependencies']

    def get_project_dependency(self, project_id, dependency_id):
        self.__refresh_state()
        if dependency_id in self.storage[self.schema]['projects'][project_id]['dependencies'].keys():
            return self.storage[self.schema]['projects'][project_id]['dependencies'][dependency_id]

    def get_dependencies(self):
        return self.schema['dependencies']

    def get_dependency(self, dependency_id):
        self.__refresh_state()
        return self.storage[self.schema]['dependencies'][dependency_id]
