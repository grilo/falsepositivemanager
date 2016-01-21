#!/usr/bin/env python

import logging
import subprocess
import shlex


class Async:

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
