#!/usr/bin/env python

class Manager:

    def __init__(self, total, items_per_page, page=1):
        self.total_items = total
        self.items_per_page = items_per_page
        self.current_page = int(page)
        self.page_count = ((self.total_items - 1) // self.items_per_page) + 1
        # Ensure our current state is good
        self.get_results()

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

    def get_results(self):
        start = (self.current_page - 1) * self.items_per_page + 1
        end = self.current_page * self.items_per_page
        if end > self.total_items:
            end = self.total_items
        if start > self.total_items or start <= 0:
            raise IndexError("Invalid item list with current page.")
        else:
            return (start, end)


if __name__ == '__main__':
    p = Manager(101, 20, 6)
    print(p.get_results())
