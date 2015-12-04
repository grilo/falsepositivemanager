import logging
import os
import hashlib
import shutil
import json
import tempfile
import collections

import task
import db


class OWASP:

    def __init__(self, cachedir='storage'):
        self.cachedir = cachedir
        self.cache = db.Storage()
        self.__tasks = {}
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")

    def scan(self, filename):
        # Generate a Unique IDentifier
        with open(filename, 'rb') as f:
            uid = hashlib.md5(f.read()).hexdigest()
        # Don't bother if the item was previously scanned
        if uid in self.cache.keys():
            return
        # Copy the file to a temporary location
        directory = tempfile.mkdtemp()
        filename_only = os.path.basename(filename)        
        shutil.copyfile(filename, os.path.join(directory, filename_only))

        # Start the scanning process
        self.__tasks[uid] = task.OWASP(filename_only, directory, self.binary)

    def get_running(self):
        # Ensure our cachedir is fresh with the latest results
        # Also, garbage collect what we don't need
        to_delete = []
        running = []
        for uid, task in self.__tasks.items():
            # Is the task done?
            if not task.is_finished():
                running.append({
                    'project': task.project,
                    'checksum': uid
                })
            else:
                if task.get_returncode() == 0:
                    self.cache[uid] = task.get_report()
                else:
                    self.cache[uid] = {'error': task.get_output()}
                logging.info("Removing temporary directory (%s) used for the task (%s)" % (task.directory, task.project))
                shutil.rmtree(task.directory)
                to_delete.append(uid)

        for uid in to_delete:
            del self.__tasks[uid]

        return running

    def get_projects(self):
        return self.cache

    def get_project(self, project_id):
        return self.cache[project_id]

    def get_dependencies(self, project_id):
        return self.cache[project_id]["dependencies"]

    def get_dependency(self, project_id, dependency_id):
        for dependency in self.cache[project_id]["dependencies"]:
            if dependency["dependency_id"]:
                return dependency
