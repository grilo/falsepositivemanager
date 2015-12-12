import shelve
import collections

class Storage(collections.MutableMapping):
    """Looks like a dict, but uses shelve underneath with automated syncs."""

    def __init__(self, filename='storage.db'):
        self.store = shelve.open(filename, writeback=True)

    def __getitem__(self, key):
        return self.store[self.__keytransform__(key)]

    def __setitem__(self, key, value):
        self.store[self.__keytransform__(key)] = value
        self.store.sync()

    def __delitem__(self, key):
        del self.store[self.__keytransform__(key)]
        self.store.sync()

    def __iter__(self):
        return iter(self.store)

    def __len__(self):
        return len(self.store)

    def __keytransform__(self, key):
        return key
