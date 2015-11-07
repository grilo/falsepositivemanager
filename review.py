import logging
import time
import os
import sys
import subprocess
import hashlib
import shutil
import shlex
import xml.etree.cElementTree as et
import json
import collections
import inspect
import re

class Error:
    def __init__(self):
        pass


class Item:

    def __init__(self, identifier, ):
        self.identifier = identifier
        self.errors = []

    def add_error(self, error):
        error.identifier = self.identifier
        error.date = int(time.time())
        self.errors.append(error)


class FalsePositiveRule:
    def __init__(self):
        pass

class FalsePositiveManager:

    def __init__(self):
        self.rules = []

    def add_rule(self, rule):
        self.rules.append(rule)

    def del_rule(self, identifier):
        for rule in self.rules:
            if rule.identifier == identifier:
                self.rules.remove(rule)
                break

    def is_false_positive(self, error):
        error_attributes = vars(error)
        for rule in self.rules:
            rule_attributes = vars(rule)
            full_match = True
    
            for k, v in rule_attributes.items():
                if not k in error_attributes.keys():
                    full_match = False
                    break
                if not re.search(v, error_attributes[k]):
                    full_match = False
                    break
            if full_match: return True
        return False


class Manager:
    def __init__(self, storage='storage'):
        # Ensure the basics are initialized
        self.storage = storage
        self.reviews = []

        # Build index
        for directory in os.listdir(self.storage):
            review_path = os.path.join(self.storage, directory)
            self.reviews.append(Review(review_path))

    def add_filename(self, filename):
        identifier = hashlib.md5(open(filename, 'rb').read()).hexdigest()
        review_path = os.path.join(self.storage, identifier)
        if not os.path.exists(review_path):
            os.makedirs(review_path)
        shutil.copyfile(filename, os.path.join(review_path, os.path.basename(filename)))
        self.reviews.append(Review(review_path))
            

class Review:

    def __init__(self, path):

        self.path = path
        self.identifier = os.path.basename(self.path)
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")
        self.report = os.path.join(self.path, "dependency-check-report.xml")
        self.vulnerabilities = []

        self.__log = os.path.join(self.path, "log")
        self.__vulns = os.path.join(self.path, "vulns")
        self.__proc = None
        if os.path.exists(self.report):
            self.vulnerabilities = self.__parse_vulnerabilities(self.report)
        else:
            self.__start()

    def ready(self):
        if os.path.exists(self.report):
            self.vulnerabilities = self.__parse_vulnerabilities(self.report)
        elif self.__proc.poll() is None:
            return False
        return True

    def __start(self):
        command = "%s -f ALL --project %s -s %s -o %s" % (self.binary, self.identifier, self.path, self.path)
        self.__proc = subprocess.Popen(shlex.split(command), stdout=open(self.__log, 'w'), stderr=subprocess.STDOUT)

    def __write_vulnerabilities(self):
        open(self.__vulns, 'w').write(json.dumps(self.vulnerabilities))

    def __read_vulnerabilities(self):
        return json.loads(open(self.__vulns, 'r').read())

    def __parse_vulnerabilities(self, report_file):
        vulnerabilities = []
        tree = et.parse(report_file)
        ns = tree.getroot().tag[1:].split("}")[0]
        for dep in tree.findall('{%s}dependencies/{%s}dependency' % (ns, ns)):
            filename = None
            md5sum = None
            for child in dep:
                if child.tag.endswith("fileName"):
                    filename = child.text
                elif child.tag.endswith("md5"):
                    md5sum = child.text
            for vuln in dep.findall("{%s}vulnerabilities/{%s}vulnerability" % (ns, ns)):
                name = None
                severity_score = None
                cwe = None
                for child in vuln:
                    if child.tag.endswith("name"):
                        name= child.text
                    elif child.tag.endswith("cvssScore"):
                        severity_score = child.text
                    elif child.tag.endswith("cwe"):
                        cwe = child.text
                vulnerabilities.append(collections.OrderedDict([
                    ("md5sum", md5sum),
                    ("Filename", filename),
                    ("Severity", severity_score),
                    ("CVE", name),
                    ("CWD", cwe),
                ]))
        return vulnerabilities
