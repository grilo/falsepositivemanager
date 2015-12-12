#!/usr/bin/env python

import logging
import time

class Manager:

    def __init__(self, storage, schema='fprules'):
        logging.info("Initializing False Positive database.")
        self.storage = storage
        self.schema = schema
        if self.schema not in self.storage.keys():
            logging.debug("No schema found for False Positive database, creating.")
            self.storage[self.schema] = {}

    def add_rule(self, dependency_id, cve):
        if not dependency_id in self.storage[self.schema].keys():
            self.storage[self.schema][dependency_id] = {
                'date': time.time(),
                'cve': [],
            }
        elif cve in self.storage[self.schema][dependency_id]['cve']:
            logging.debug("Rule (%s::%s) already exists." % (dependency_id, cve))
            return
        logging.info("Adding false positive rule for dependency (%s) with cve (%s)." % (dependency_id, cve))
        self.storage[self.schema][dependency_id]['cve'].append(cve)

    def del_rule(self, dependency_id, cve):
        logging.info("Deleting false positive rule for dependency (%s) with cve (%s)." % (dependency_id, cve))
        self.storage[self.schema][dependency_id]['cve'].remove(cve)
        if len(self.storage[self.schema][dependency_id]['cve']) <= 0:
            del self.storage[self.schema][dependency_id]

    def get_rules(self):
        return self.storage[self.schema]

    def is_false_positive(self, project_id, dependency_id, cve):
        if not dependency_id in self.storage[self.schema].keys():
            return False
        elif not cve in self.storage[self.schema][dependency_id]['cve']:
            return False
        return True
