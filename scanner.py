import logging
import traceback
import os
import hashlib
import shutil
import json
import tempfile
import collections

import task

import peewee
import models


class OWASP:

    def __init__(self, storage, fp):
        self.storage = storage
        self.fp = fp
        self.__tasks = {}
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")

    def scan(self, filename):
        # Generate a Unique IDentifier
        with open(filename, 'rb') as f:
            task_id = hashlib.sha1(f.read()).hexdigest()
            try:
                # Don't bother if the item was previously scanned
                p = models.Project.get(models.Project.id == task_id)
                logging.debug("File already processed (%s %s)" % (task_id, filename))
                return
            except models.Project.DoesNotExist:
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
                    try:
                        p = models.Project.create(id=task_id, name=report["name"], date=report["date"])
                    except peewee.IntegrityError:
                        models.Project.get(models.Project.id == task_id).delete()
                        p = models.Project.create(id=task_id, name=report["name"], date=report["date"])
                    for k, v in report["dependencies"].items():
                        d = models.Dependency.create(project=task_id, checksum=k, name=v["name"])
                        for vulnerability in v["vulnerabilities"]:
                            c = models.Vulnerability.create(
                                description=vulnerability["description"],
                                cve=vulnerability["cve"],
                                cwe=vulnerability["cwe"],
                                cwe_description=vulnerability["cwe_description"],
                                severity=vulnerability["severity"],
                                dependency=d.id)
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
        return
        for project_id, project in self.storage['projects'].items():
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

    def cancel_running(self, project_id):
        for task_id, task in self.__tasks.items():
            if project_id == task_id:
                task.kill()
        del self.__tasks[project_id]
        return True

    def get_project_count(self):
        return models.Project.select().count()

    def get_projects(self, page=1, limit=10):
        self.__refresh_state()
        results = []
        for p in models.Project.select().order_by(models.Project.date.desc()).paginate(page, limit).dicts():
            p["dependencies"] = 0
            p["vulnerabilities"] = 0
            p["falsepositives"] = 0
            for d in models.Dependency.select().where(models.Dependency.project == p["id"]).dicts():
                p["dependencies"] += 1
                p["vulnerabilities"] = models.Vulnerability.select().where(models.Vulnerability.dependency == d["id"], models.Vulnerability.false_positive == False).count()
                p["falsepositives"] = models.Vulnerability.select().where(models.Vulnerability.dependency == d["id"] & models.Vulnerability.false_positive == True).count()
            results.append(p)
        return results

    def get_project_dependencies(self, project_id):
        self.__refresh_state()
        return models.Dependency.select().where(models.Dependency.project == project_id).dicts()

    def get_project_dependency(self, project_id, dependency_id):
        self.__refresh_state()
        return
        if dependency_id in self.storage['projects'][project_id]['dependencies'].keys():
            return self.storage['projects'][project_id]['dependencies'][dependency_id]

    def get_dependencies(self):
        return

    def get_dependency(self, dependency_id):
        self.__refresh_state()
        return
        return self.storage['dependencies'][dependency_id]

    def get_dependency_vulnerabilities(self, dependency_id):
        return models.Vulnerability.select().where(models.Vulnerability.dependency == dependency_id).dicts()
