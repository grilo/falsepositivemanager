from review import *

fpman = FalsePositiveManager()

rule1 = FalsePositiveRule()
rule1.identifier = '^h.*w'
rule1.xpto = 'hello'
fpman.add_rule(rule1)


e = Error()
item = Item('helloworld')
item.add_error(e)

for e in item.errors:
    if fpman.is_false_positive(e):
        print("False positive!")
