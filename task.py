#!/usr/bin/env python

import subprocess
import shlex
import time
import os
import xml.etree.cElementTree as et
import collections


class AsyncTask:

    def __init__(self, command):
        self.command = command
        self.__proc = None
        self.finished = False

    def start(self):
        self.__proc = subprocess.Popen(shlex.split(self.command), stderr=subprocess.STDOUT, universal_newlines=True)

    def get_output(self):
        return self.__proc.stdout

    def get_returncode(self):
        return self.__proc.returncode

    def kill(self):
        # We don't actually send a SIGKILL since this may cause severe issues
        # with unclosed file descriptors and such.
        return self.__proc.terminate()

    def is_finished(self):
        if self.__proc.poll() is not None:
            self.finished = True
        return self.finished


class OWASP(AsyncTask):

    def __init__(self, name, directory, binary='dependency-check.sh'):
        self.name = name
        self.directory = directory
        self.binary = binary
        self.report = os.path.join(self.directory, "dependency-check-report.xml")
        command = "%s -f ALL --project %s -s %s -o %s" % (binary, name, directory, directory)
        super().__init__(command)

    def get_report(self):
        """
        Our schema is:
            {
                name: <name>
                dependencies: [
                    {
                        name: <dependency_name>,
                        dependency_id: <sha1sum>,
                        vulnerabilities: [
                            {
                                description: <description>,
                                cve: <cve>,
                                cwe: <cwe>,
                                cwe_description: <cwe_description>,
                                severity: <severity>,
                            }
                    }
                     
                ]
            }
        """
        report = {
            'name': self.name,
            'date': time.time(),
            'dependencies': {},
        }
        tree = et.parse(self.report)
        ns = tree.getroot().tag[1:].split("}")[0]
        for dep in tree.findall('{%s}dependencies/{%s}dependency' % (ns, ns)):
            filename = ""
            dependency_id = ""
            vulnerabilities = []
            for child in dep:
                if child.tag.endswith("fileName"):
                    filename = child.text
                elif child.tag.endswith("sha1"):
                    dependency_id = child.text

            for vuln in dep.findall("{%s}vulnerabilities/{%s}vulnerability" % (ns, ns)):
                description = None
                name = None
                severity_score = None
                cwe = None
                cwe_description = None
                for child in vuln:
                    if child.tag.endswith("description"):
                        description = child.text
                    elif child.tag.endswith("name"):
                        name = child.text
                    elif child.tag.endswith("cvssScore"):
                        severity_score = child.text
                    elif child.tag.endswith("cwe"):
                        # CWE may contain a small description as well
                        splitted = child.text.split(' ', 1)
                        cwe = splitted[0]
                        if len(splitted) == 2:
                            cwe_description = splitted[1]
                vulnerabilities.append({
                    "description": description,
                    "severity": severity_score,
                    "cve": name,
                    "cwe": cwe,
                    "cwe_description": cwe_description,
                })
            dependency = {
                'name': filename,
                'vulnerabilities': vulnerabilities,
            }
            report['dependencies'][dependency_id] = dependency
        return report
