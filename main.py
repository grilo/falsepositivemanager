import logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s::%(levelname)s::%(message)s')

import json
import bottle
from bottle import Bottle, route, run, request, response, static_file, get

app = Bottle()
bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024

@app.hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
 

@app.route('/<filename:re:.*\.(css|js|jpg|png|gif|ico|ttf|eot|woff|woff2|svg|jsr)>')
def javascripts(filename):
    return static_file(filename, root='')

@app.route('/owasp/projects', method=['GET'])
def get_projects():
    contents = []
    for project_id, project in scanner.get_projects().items():
        p = {}
        p["project_id"] = project_id
        p["name"] = project["name"]
        p["date"] = project["date"]
        dep_count = len(project["dependencies"])
        vuln_count = 0
        fp_count = 0
        for dependency in project["dependencies"].values():
            for vuln in dependency["vulnerabilities"]:
                if vuln["falsepositive"]:
                    fp_count += 1
                else:
                    vuln_count += 1
        p["dependencies"] = dep_count
        p["vulnerabilities"] = vuln_count
        p["falsepositives"] = fp_count
        contents.append(p)
    return json.dumps(contents)

@app.route('/owasp/projects', method=['POST'])
def upload_project():
    upload = request.files['uploadfile']
    import os
    import shutil
    import tempfile
    temp_dir = tempfile.mkdtemp()
    upload.save(temp_dir)
    scanner.scan(os.path.join(temp_dir, upload.filename))
    shutil.rmtree(temp_dir)
    return json.dumps(['Upload OK!'])

@app.route('/owasp/projects/<project_id>', method=['DELETE'])
def cancel_project():
    return json.dumps(['Should be cancelling ' + project_id])

@app.route('/owasp/projects/<project_id>')
def get_project(project_id):
    dependencies = []
    for dependency_id, dependency in scanner.get_project_dependencies(project_id).items():
        d = {}
        d["dependency_id"] = dependency_id
        d["name"] = dependency["name"]
        d["vulnerabilities"] = []
        d["falsepositives"] = []
        for v in dependency["vulnerabilities"]:
            if v["falsepositive"]:
                d["falsepositives"].append(v)
            else:
                d["vulnerabilities"].append(v)
        dependencies.append(d)
    return json.dumps(dependencies)

@app.route('/owasp/projects/<project_id>/dependencies/<dependency_id>')
def get_project_dependency(project_id, dependency_id):
    dependency = scanner.get_project_dependency(project_id, dependency_id)
    d = {
        "name": dependency["name"]
    }
    d["vulnerabilities"] = []
    d["falsepositives"] = []

    for dep in dependency["vulnerabilities"]:
        if dep["falsepositive"]:
            d["falsepositives"].append(dep)
        else:
            d["vulnerabilities"].append(dep)
    return json.dumps(d)

@app.route('/owasp/dependencies')
def get_dependencies():
    return json.dumps(scanner.get_dependencies())

@app.route('/owasp/dependencies/<dependency_id>')
def get_dependency():
    return json.dumps(scanner.get_dependency(dependency_id))

@app.route('/owasp/falsepositives', method=['GET'])
def get_false_positives():
    rules = []
    for dependency_id, rule in fp.get_rules().items():
        for cve in rule["cve"]:
            r = {}
            r["dependency_id"] = dependency_id
            r["cve"] = cve
            r["date"] = rule["date"]
            r["name"] = scanner.get_dependency(dependency_id)['name']
            rules.append(r)
    return json.dumps(rules)

@app.route('/owasp/falsepositives', method=['POST'])
def add_false_positive():
    fp.add_rule(request.json['dependency_id'], request.json['cve'])
    return json.dumps(['OK!'])

@app.route('/owasp/falsepositives/<dependency_id>/cve/<cve>', method=['DELETE'])
def del_false_positive(dependency_id, cve):
    fp.del_rule(dependency_id, cve)
    return json.dumps(['OK!'])

@app.route('/owasp/running')
def get_running():
    return json.dumps(scanner.get_running())

@app.route('/owasp/dump')
def dbdump():
    return json.dumps(dict(storage.store))

@app.route('/')
def hello():
    f = open('static/index.html')
    contents = f.read()
    f.close()
    return contents

import db
import scanner
import falsepositive
storage = db.Storage()
fp = falsepositive.Manager(storage)
scanner = scanner.OWASP(storage, fp)
run(app, host='localhost', port=8080, debug=True)
