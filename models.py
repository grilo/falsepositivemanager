import peewee

db = peewee.SqliteDatabase('ingowasp.sqlite')

class BaseModel(peewee.Model):
    class Meta:
        database = db

class Project(BaseModel):

    id = peewee.CharField(primary_key=True)
    name = peewee.CharField()
    date = peewee.DateField(null=False)

class Dependency(BaseModel):
    checksum = peewee.CharField()
    name = peewee.CharField()
    project = peewee.ForeignKeyField(Project)

class Vulnerability(BaseModel):
    cve = peewee.CharField(primary_key=True)
    description = peewee.CharField()
    cwe = peewee.CharField()
    cwe_description = peewee.CharField()
    severity = peewee.CharField()
    false_positive = peewee.BooleanField(default=False)
    dependency = peewee.ForeignKeyField(Dependency)


db.connect()
db.create_tables([Vulnerability, Project, Dependency], True)

#p = Projects.create(name="helloworld", date=1452994080)
#
#for i in Projects.select().dicts():
#    print(i)
#
#d = Dependencies(project=20, checksum="md5blah", name="com.ingdirect.es")
#print(d.project.name)
#
#for i in models.Project.select().dicts():
#    print(i)
#
#for i in models.Dependency.select().where(models.Dependency.project == '6b1c837d1c30ba67392004a196ccb061b453f0ee').dicts():
#    print(i)
#
#for i in models.Vulnerability.select().where(models.Vulnerability.dependency == '1').dicts():
#    print('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
#    print(i)
