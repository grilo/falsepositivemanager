import logging
import os
import hashlib
import shutil
import json
import tempfile
import collections

import task


class OWASP:

    def __init__(self, cachedir='storage'):
        self.cachedir = cachedir
        self.cache = {}
        self.__tasks = {}
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")
        if not os.path.exists(self.cachedir):
            os.makedirs(self.cachedir)

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

    def __refresh_cache(self):
        # Ensure our cachedir is fresh with the latest results
        # Also, garbage collect what we don't need
        to_delete = []
        for uid, task in self.__tasks.items():
            task_cache = os.path.join(self.cachedir, uid)
            # Is the task done?
            if not task.is_finished():
                self.cache[uid] = 'Running'
            else:
                # Make sure we have a place where to store the scan's results
                if not os.path.exists(os.path.join(self.cachedir, uid)):
                    os.makedirs(os.path.join(self.cachedir, uid))
                results_file = open(os.path.join(task_cache, 'result.json'), 'w')
                if task.get_returncode() == 0:
                    results_file.write(json.dumps(task.get_report()))
                else:
                    results_file.write(json.dumps({'error': task.get_output()}))
                results_file.close()
                logging.info("Removing temporary directory (%s) used for the task (%s)" % (task.directory, task.project))
                #shutil.rmtree(task.directory)
                to_delete.append(uid)

        for uid in to_delete:
            del self.__tasks[uid]

        # Load the entire cache from the disk
        for uid in os.listdir(self.cachedir):
            results = os.path.join(self.cachedir, uid, 'result.json')
            try:
                with open(results, 'r') as result:
                    # Keep the order of the fields by using object_pairs_hook
                    self.cache[uid] = json.loads(result.read(), object_pairs_hook=collections.OrderedDict)
            except FileNotFoundError:
                # This most likely means someone has been tampering with
                # our cache. Ignore the entry and log an error
                logging.error("Expected to find the file (%s), but it doesn't exist." % (results))

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
                task_store = os.path.join(self.cachedir, uid)
                # Make sure we have a place where to store the scan's results
                if not os.path.exists(task_store):
                    os.makedirs(os.path.join(task_store))
                results_file = open(os.path.join(task_store, 'result.json'), 'w')
                if task.get_returncode() == 0:
                    results_file.write(json.dumps(task.get_report()))
                else:
                    results_file.write(json.dumps({'error': task.get_output()}))
                results_file.close()
                logging.info("Removing temporary directory (%s) used for the task (%s)" % (task.directory, task.project))
                shutil.rmtree(task.directory)
                to_delete.append(uid)

        for uid in to_delete:
            del self.__tasks[uid]

        return running

    def get_results(self, uid=None):
        self.__refresh_cache()
        if uid:
            return self.cache[uid]
        else:
            return self.cache
