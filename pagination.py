#!/usr/bin/env python

class Manager:

    def __init__(self, item_count, page_size, page=1):
        self.item_count = item_count
        self.page_size = page_size
        self.current_page = int(page)
        self.page_count = ((self.item_count - 1) // self.page_size) + 1
        # Ensure our current state is good
        self.get_start_end()

    def count(self):
        return self.page_count

    def current(self):
        return self.current_page

    def next(self):
        if self.current_page >=  self.page_count:
            return 0
        return self.current_page + 1

    def prev(self):
        if self.current_page <=  0:
            return 0
        return self.current_page - 1

    def set_page(self, page_number):
        self.current_page = page_number

    def get_start_end(self):
        start = (self.current_page - 1) * self.page_size + 1
        end = self.current_page * self.page_size
        if end > self.item_count:
            end = self.item_count
        if start > self.item_count or start <= 0:
            raise IndexError("Invalid item list with current page.")
        else:
            return (start, end)

    def to_json(self):
        return {
            "item_count": self.item_count,
            "page_count": self.count(),
            "page_size": self.page_size,
            "current": self.current(),
            "pages": [i for i in range(self.page_count)],
            "prev": str(self.prev()),
            "next": str(self.next()),
        }


if __name__ == '__main__':
    p = Manager(101, 20, 6)
    print(p.get_start_end())
