#!/usr/bin/env python

import subprocess
import shlex
import os
import xml.etree.cElementTree as et
import collections


class AsyncTask:

    def __init__(self, command):
        self.__proc = subprocess.Popen(shlex.split(command), stderr=subprocess.STDOUT, universal_newlines=True)
        self.finished = False

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

    def __init__(self, project, directory, binary='dependency-check.sh'):
        self.project = project 
        self.directory = directory
        self.binary = binary
        self.report = os.path.join(self.directory, "dependency-check-report.xml")
        command = "%s -f ALL --project %s -s %s -o %s" % (binary, project, directory, directory)
        super().__init__(command)

    def get_report(self):
        """
        Our schema is:
            {
                project: <name>
                dependencies: [
                    {
                        name: <dependency_name>,
                        md5: <checksum>,
                        sha1: <checksum>,
                        vulnerabilities: [
                            {
                                cve: <cve>,
                                cwe: <cwe>,
                                severity: <severity>,
                            }
                    }
                     
                ]
            }
        """
        report = {
            'project': self.project,
            'dependencies': [],
        }
        tree = et.parse(self.report)
        ns = tree.getroot().tag[1:].split("}")[0]
        for dep in tree.findall('{%s}dependencies/{%s}dependency' % (ns, ns)):
            filename = ""
            md5sum = ""
            shasum = ""
            dependency_id = ""
            vulnerabilities = []
            for child in dep:
                if child.tag.endswith("fileName"):
                    filename = child.text
                elif child.tag.endswith("md5"):
                    md5sum = child.text
                elif child.tag.endswith("sha1"):
                    shasum = child.text
            for vuln in dep.findall("{%s}vulnerabilities/{%s}vulnerability" % (ns, ns)):
                name = None
                severity_score = None
                cwe = None
                description = None
                for child in vuln:
                    if child.tag.endswith("name"):
                        name = child.text
                    elif child.tag.endswith("cvssScore"):
                        severity_score = child.text
                    elif child.tag.endswith("cwe"):
                        cwe = child.text
                vulnerabilities.append({
                    "severity": severity_score,
                    "cve": name,
                    "cwe": cwe,
                })
            dependency = {
                'name': filename,
                'vulnerabilities': vulnerabilities,
                'md5sum': md5sum,
                'shasum': shasum,
                'dependency_id': md5sum,
            }
            report['dependencies'].append(dependency)
        return report
