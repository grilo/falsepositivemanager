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
    cve = peewee.CharField()
    description = peewee.CharField()
    cwe = peewee.CharField()
    cwe_description = peewee.CharField()
    severity = peewee.CharField()
    dependency = peewee.ForeignKeyField(Dependency)

class FalsePositive(BaseModel):
    date = peewee.DateField(null=False)
    cve = peewee.CharField()
    dependency = peewee.ForeignKeyField(Dependency)


# Helper class
class DAO:

    def __init__(self):
        db.connect()
        db.create_tables([Vulnerability, Project, Dependency, FalsePositive], True)

    def update_database(self, report):
        p = {
            "id": report["id"],
            "name": report["name"],
            "date": report["date"],
        }
        project = self.create_project(p)

        for dep in report["dependencies"]:
            d = {
                "project": project.id,
                "checksum": dep["checksum"],
                "name": dep["name"],
            }
            dependency = self.create_dependency(d)

            for vuln in dep["vulnerabilities"]:
                vuln["dependency"] = dependency.id
                self.create_vulnerability(vuln)


    def create_project(self, project):
        if self.project_exists(project["id"]):
            logging.warning("Project %s requested to be created again. Deleting before we proceed..." % (project["id"]))
            self.delete_project(project["id"])
        return Project.create(**project)

    def delete_project(self, id):
        return Project.delete().where(Project.id == id).execute()

    def project_exists(self, id):
        return Project.select().where(Project.id == id).exists()

    def create_false_positive(self, falsepositive):
        return FalsePositive.create(**falsepositive)

    def delete_false_positive(self, dependency_id, cve):
        return FalsePositive.get(FalsePositive.dependency == depedency_id & FalsePositive.cve == cve).delete()

    def get_false_positives(self):
        return FalsePositive.select().dicts()

    def create_dependency(self, dependency):
        return Dependency.create(**dependency)

    def create_vulnerability(self, vulnerability):
        return Vulnerability.create(**vulnerability)

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
                p["vulnerabilities"] += Vulnerability.select().where(Vulnerability.dependency == d["id"]).count()
                p["falsepositives"] += FalsePositive.select().where(FalsePositive.dependency == d["id"]).count()
            p["vulnerabilities"] -= p["falsepositives"]
            results.append(p)
        return results

    def get_project_dependencies(self, project_id):
        return Dependency.select().where(Dependency.project == project_id).dicts()

    def get_dependency_vulnerabilities(self, dependency_id):
        falsepositives = []
        cve = []
        for fp in FalsePositive.select().where(FalsePositive.dependency == dependency_id).dicts():
            falsepositives.append(fp)
            cve.append(fp["cve"])

        vulnerabilities = []
        for v in Vulnerability.select().where(Vulnerability.dependency == dependency_id).dicts():
            if v["cve"] in cve: continue
            vulnerabilities.append(v)

        return {'falsepositives': falsepositives, 'vulnerabilities': vulnerabilities}


if __name__ == '__main__':
    d = DAO()
    d.get_dependency_vulnerabilities(129)
