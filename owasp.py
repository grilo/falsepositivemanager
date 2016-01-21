import logging
import hashlib
import tempfile
import os
import shutil
import re
import xml.etree.cElementTree as et
import datetime
import time

import task


class Task(task.Async):

    def __init__(self, filename, binary='./dependency-check/bin/dependency-check.sh'):

        with open(filename, "rb") as f:
            self.id = hashlib.sha1(f.read()).hexdigest()
        self.directory = tempfile.mkdtemp()
        self.filename_only = os.path.basename(filename)
        self.binary = binary
        self.report = os.path.join(self.directory, "dependency-check-report.xml")
        command = "%s -f ALL --project %s -s %s -o %s -n" % (binary, self.filename_only, self.directory, self.directory)
        shutil.copyfile(filename, os.path.join(self.directory, self.filename_only))

        super().__init__(command)

    def get_xml(self):
        with open(self.report, "r") as f:
            report = f.read()
        logging.info("Removing temporary directory (%s) used for the task (%s)" % (self.directory, self.id))
        shutil.rmtree(self.directory)
        return report


class Scanner:

    def __init__(self):
        self.__running = []
        self.__done = []

    def add_task(self, task):
        self.__running.append(task)
        task.start()

    def __refresh(self):
        # Ensure our cachedir is fresh with the latest results
        # Also, garbage collect what we don't need
        for task in list(self.__running):
            if not task.is_finished(): continue
            if task.get_returncode() != 0:
                logging.error("Error executing the task! id (%s) cmd (%s) ex (%s)" % (task.id, task.command))
            else:
                self.__done.append(task)
            self.__running.remove(task)

    def get_finished(self):
        reports = [Report(task.id, task.get_xml()).parse() for task in self.__done]
        self.__done = [] # Clear our 'done' queue
        return reports

    def get_running(self):
        self.__refresh()
        return [t.id for t in self.__running]

    def cancel(self, project_id):
        self.__refresh()
        for t in list(self.__running):
            if t.id == project_id:
                t.kill()
                self.__running.remove(t)
                return True
        return False


class Report:

    __version__ = '1.3'

    def __init__(self, id, xml_report):
        self.id = id
        # Extract the namespace from the string
        schema_version = re.search('dependency-check\.(.*)\.xsd', xml_report).group(1)
        if schema_version != Report.__version__:
            logging.warning("This OWASP report parser is expecting version (%s) but this report is from version (%s)" % (Report.__version__, schema_version))
        self.xml_report = re.sub('xmlns=".*?"', '', xml_report)

    def parse(self):
        root = et.fromstring(self.xml_report)
        return {
            'id': self.id,
            'name': root.findall('projectInfo/name')[0].text,
            'date': self.iso8601_to_epoch(root.findall('projectInfo/reportDate')[0].text),
            'dependencies': [d for d in self._parse_dependencies(root)],
        }

    def iso8601_to_epoch(self, ts):
        dt = datetime.datetime.strptime(ts[:-7],'%Y-%m-%dT%H:%M:%S.%f')+ \
            datetime.timedelta(hours=int(ts[-5:-3]),
            minutes=int(ts[-2:]))*int(ts[-6:-5]+'1')
        return time.mktime(dt.timetuple()) + dt.microsecond/1000000.0

    def _parse_dependencies(self, root):
        for d in root.findall('dependencies/dependency'):
            # Get the filename and the maven coordinates if available
            try:
                filename = d.find("identifiers/identifier[@type='maven']/name").text
                filename = filename.strip(")").strip("(")
            except AttributeError:
                filename = d.find("fileName").text
                logging.warning("Unable to find mvn coords (%s), defaulting to fileName." % (filename))

            yield {
                'checksum': d.find("sha1").text,
                'name': filename,
                "vulnerabilities": [v for v in self._parse_vulnerabilities(d)]
            }

    def _parse_vulnerabilities(self, root):
        for v in root.findall("vulnerabilities/vulnerability"):
            cwe_description = ""
            try:
                cwe = v.find("cwe").text
                # CWE may contain a small description as well
                splitted = cwe.split(' ', 1)
                cwe = splitted[0]
                if len(splitted) == 2:
                    cwe_description = splitted[1]
            except AttributeError:
                cwe = "N/A"
                logging.debug("Unable to find CWE (vulnerability TYPE) (%s)" % v.find("name").text)

            yield {
                "description": v.find("description").text,
                "severity": v.find("cvssScore").text,
                "cve": v.find("name").text,
                "cwe": cwe,
                "cwe_description": cwe_description,
            }

if __name__ == '__main__':
    scanner = Scanner()
    scanner.add_task(Task('test/tomcat-embed-core.jar'))
    import time
    while scanner.get_running():
        time.sleep(1)
        print(".")

    import pprint
    for report in scanner.get_finished():
        pprint.pprint(report)
    #x = Report(open("test/xmlreport", "r").read())
    #pprint.pprint(x.parse())
