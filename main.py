#!/usr/bin/env python

import logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s::%(levelname)s::%(message)s')
import json
import multiprocessing
import os
import shutil
import tempfile
import time

import bottle

import db
import scanner
import models
import pagination

app = bottle.Bottle()
bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024
storage = db.Storage()
dao = models.DAO()
scanner = scanner.OWASP(dao)

@app.hook('after_request')
def enable_cors():
    """
    You need to add some headers to each request.
    Don't use the wildcard '*' for Access-Control-Allow-Origin in production.
    """
    bottle.response.headers['Access-Control-Allow-Origin'] = '*'
    bottle.response.headers['Access-Control-Allow-Methods'] = 'PUT, GET, POST, DELETE, OPTIONS'
    bottle.response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'


@app.route('/<filename:re:.*\.(css|js|jpg|png|gif|ico|ttf|eot|woff|woff2|svg|jsr)>')
def javascripts(filename):
    return bottle.static_file(filename, root='')

@app.route('/owasp/projects/<page>', method=['GET'])
def get_projects_page(page="all"):
    project_count = dao.get_project_count()
    max_per_page = 12
    if page == "all":
        page = 1
        max_per_page = project_count

    try:
        paginator = pagination.Manager(project_count, max_per_page, page)
        contents = {}
        contents["page"] = {
                "total_items": paginator.total_items,
                "total_pages": paginator.page_count,
                "items_per_page": paginator.items_per_page,
                "current": paginator.current(),
                "pages": [],
                "prev": '/owasp/projects/' + str(paginator.prev()),
                "next": '/owasp/projects/' + str(paginator.next()),
        }
        for i in range(paginator.count()):
            contents["page"]["pages"].append('/owasp/projects/' + str(i + 1))
        if paginator.prev() == 0:
            contents["page"]["prev"] = ""
        if paginator.next() == 0:
            contents["page"]["next"] = ""

        start, end = paginator.get_results()
        start -= 1
        contents["projects"] = []
        for p in dao.get_projects(paginator.current(), paginator.items_per_page):
            p["project_id"] = p["id"]
            contents["projects"].append(p)
        return json.dumps(contents)
    except IndexError:
        logging.debug("Exception throw, incorrect page? %s" % (str(page)))
        bottle.abort(404, "This page (%s) contains no projects to be shown." % (str(page)))


@app.route('/owasp/projects', method=['GET'])
def get_projects():
    return get_projects_page(page="all")

@app.route('/owasp/project', method=['POST'])
def upload_project():
    upload = bottle.request.files['uploadfile']
    temp_dir = tempfile.mkdtemp()
    upload.save(temp_dir)
    scanner.scan(os.path.join(temp_dir, upload.filename))
    shutil.rmtree(temp_dir)
    return json.dumps(['Upload OK!'])

@app.route('/owasp/running/<project_id>', method=['DELETE'])
def cancel_project(project_id):
    if scanner.cancel_running(project_id):
        return json.dumps(['Cancelled ' + project_id])

@app.route('/owasp/project/<project_id>')
def get_project(project_id):
    dependencies = []
    for d in dao.get_project_dependencies(project_id):
        vulns = dao.get_dependency_vulnerabilities(d["id"])
        vulns["dependency_id"] = d["id"]
        dependencies.append(vulns)
    return json.dumps(dependencies)

@app.route('/owasp/project/<project_id>/dependencies/<dependency_id>')
def get_project_dependency(project_id, dependency_id):
    dependency = dao.get_project_dependency(project_id, dependency_id)
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
    return json.dumps(dao.get_dependencies())

@app.route('/owasp/dependencies/<dependency_id>')
def get_dependency():
    return json.dumps(dao.get_dependency(dependency_id))

@app.route('/owasp/falsepositives', method=['GET'])
def get_false_positives():
    rules = []
    for fp in dao.get_false_positives():
        rules.append(fp)
    return json.dumps(rules)

@app.route('/owasp/falsepositives', method=['POST'])
def add_false_positive():
    dao.create_false_positive(date=time.time(), dependency=bottle.request.json['dependency_id'], cve=bottle.request.json['cve'])
    return json.dumps(['OK!'])

@app.route('/owasp/falsepositives/<dependency_id>/cve/<cve>', method=['DELETE'])
def del_false_positive(dependency_id, cve):
    dao.delete_false_positive(id=dependency_id, cve=cve)
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

bottle.run(app, host='localhost', port=8080, debug=True)
