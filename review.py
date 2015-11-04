import logging
import time
import os
import sys
import subprocess
import hashlib
import shutil
import shlex


class Request:

    def __init__(self, directory):
        self.identifier = os.path.basename(directory)
        self.binary = os.path.join("dependency-check", "bin", "dependency-check.sh")
        self.__directory = directory
        self.__log = os.path.join(directory, "log")
        self.__done = os.path.join(directory, "done")
        # Calculate the md5 of the corresponding filename
        self.__proc = None

    def start(self):
        if os.path.exists(self.__done):
            return False
        command = "%s -f ALL --project %s -s %s -o %s" % (self.binary, self.identifier, self.__directory, self.__directory)
        open(os.path.join(self.__directory, "started"), 'a').close()
        self.__proc = subprocess.Popen(shlex.split(command), stdout=open(self.__log, 'w'), stderr=subprocess.STDOUT)

    def done(self):
        if self.__proc is None:
            return True
        elif self.__proc.poll() is None:
            return False
        else:
            open(self.__done, 'a').close()
            return True

class Manager:
    def __init__(self, storage='storage'):
        # Ensure the basics are initialized
        self.storage = storage
        self.index = os.path.join(self.storage, "index")
        if not os.path.exists(self.index):
            logging.warning("Creating required filesystem structure (%s)" % self.index)
            os.makedirs(self.index)

        self.requests = []
            
    def __load_index(self):
        pass

    def generate_index(self):
        self.__load_index()
        pass


    def add_review(self, filename):
        checksum = hashlib.md5(open(filename, 'rb').read()).hexdigest()
        target_dir = os.path.join(self.storage, checksum)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
        shutil.copyfile(filename, os.path.join(target_dir, os.path.basename(filename)))
        r = Request(target_dir)
        r.start()
        self.requests.append(r)

    def set_review_state(self, identifier, state):
        pass

    def get_review_state(self, identifier):
        pass

    def wait(self):
        while True:
            time.sleep(1)
            all_done = True
            for r in self.requests[:]:
                if not r.done():
                    all_done = False
                    break
                else:
                    self.requests.remove(r)
            if all_done:
                break
            print("Processes: %i" % len(self.requests))

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s::%(levelname)s::%(message)s')
    m = Manager()
    m.add_review('elasticsearch-2.0.0.jar')
    m.add_review('/home/grilo/Downloads/hadoop-hdfs-2.6.2.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/commons-lang/commons-lang/2.4/commons-lang-2.4.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/ch/qos/logback/logback-core/1.1.3/logback-core-1.1.3.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/ch/qos/logback/logback-classic/1.1.3/logback-classic-1.1.3.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/com/sun/mail/mailapi/1.5.4/mailapi-1.5.4.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/com/h2database/h2/1.3.176/h2-1.3.176.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/slf4j/slf4j-api/1.7.12/slf4j-api-1.7.12.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/jsoup/jsoup/1.8.3/jsoup-1.8.3.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/ant/ant/1.9.6/ant-1.9.6.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/velocity/velocity/1.7/velocity-1.7.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/commons/commons-lang3/3.4/commons-lang3-3.4.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/commons/commons-compress/1.10/commons-compress-1.10.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/lucene/lucene-sandbox/4.7.2/lucene-sandbox-4.7.2.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/lucene/lucene-analyzers-common/4.7.2/lucene-analyzers-common-4.7.2.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/lucene/lucene-queryparser/4.7.2/lucene-queryparser-4.7.2.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/lucene/lucene-core/4.7.2/lucene-core-4.7.2.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/apache/lucene/lucene-queries/4.7.2/lucene-queries-4.7.2.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/glassfish/javax.json/1.0.4/javax.json-1.0.4.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/owasp/dependency-check-cli/1.3.1/dependency-check-cli-1.3.1.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/owasp/dependency-check-core/1.3.1/dependency-check-core-1.3.1.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/org/owasp/dependency-check-utils/1.3.1/dependency-check-utils-1.3.1.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/javax/activation/activation/1.1/activation-1.1.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/commons-collections/commons-collections/3.2.1/commons-collections-3.2.1.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/commons-cli/commons-cli/1.3.1/commons-cli-1.3.1.jar')
    m.add_review('/home/grilo/Downloads/dependency-check/repo/commons-io/commons-io/2.4/commons-io-2.4.jar')
    m.add_review('/home/grilo/Downloads/elasticsearch-2.0.0.jar')
    m.add_review('/home/grilo/Downloads/artifactory-web-application-4.2.1.jar')
    m.add_review('/home/grilo/Downloads/jfrog-artifactory-oss-4.2.1 (1).jar')
    m.add_review('/home/grilo/Downloads/jfrog-artifactory-oss-4.2.1.jar')
    m.add_review('/home/grilo/Downloads/artifactory-core-4.2.1.jar')

    m.wait()
