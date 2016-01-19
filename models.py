import logging
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
    dependency = peewee.ForeignKeyField(Dependency)

class FalsePositive(BaseModel):
    date = peewee.DateField(null=False)
    dependency = peewee.ForeignKeyField(Dependency)
    cve = peewee.ForeignKeyField(Vulnerability)


# Helper class
class DAO:

    def __init__(self):
        db.connect()
        db.create_tables([Vulnerability, Project, Dependency, FalsePositive], True)

    def create_project(self, **properties):
        return Project.create(**properties)

    def delete_project(self, id):
        logging.debug("Deleting project: %s" % (id))
        return Project.get(Project.id == id).delete()

    def project_exists(self, id):
        return Project.select().where(Project.id == id).exists()

    def create_false_positive(self, **properties):
        return FalsePositive.create(**properties)

    def delete_false_positive(self, dependency_id, cve):
        return FalsePositive.get(FalsePositive.dependency == depedency_id & FalsePositive.cve == cve).delete()

    def get_false_positives(self):
        return FalsePositive.select().dicts()

    def create_dependency(self, **properties):
        return Dependency.create(**properties)

    def create_vulnerability(self, **properties):
        return Vulnerability.create(**properties)

    def get_project_count(self):
        return Project.select().count()

    def get_projects(self, page=1, limit=10):
        results = []
        for p in Project.select().order_by(Project.date.desc()).paginate(page, limit).dicts():
            p["dependencies"] = 0
            p["vulnerabilities"] = 0
            p["falsepositives"] = 0
            for d in Dependency.select().where(Dependency.project == p["id"]).dicts():
                p["dependencies"] += 1
                p["vulnerabilities"] = Vulnerability.select().where(Vulnerability.dependency == d["id"]).count()
                p["falsepositives"] = Vulnerability.select().join(FalsePositive).where(Vulnerability.dependency == d["id"]).count()
                p["vulnerabilities"] -= p["falsepositives"]
            results.append(p)
        return results

    def get_project_dependencies(self, project_id):
        return Dependency.select().where(Dependency.project == project_id).dicts()

    def get_dependency_vulnerabilities(self, dependency_id):
        falsepositives = []
        for fp in Vulnerability.select().join(FalsePositive).where(Vulnerability.dependency == dependency_id).dicts():
            falsepositives.append(fp)

        vulnerabilities = []
        for v in Vulnerability.select().where(Vulnerability.dependency == dependency_id).dicts():
            if v in falsepositives: continue
            vulnerabilities.append(v)

        return {'falsepositives': falsepositives, 'vulnerabilities': vulnerabilities}


if __name__ == '__main__':
    d = DAO()
    #d.get_dependency_vulnerabilities(129)
    d.get_dependency_vulnerabilities(59)
