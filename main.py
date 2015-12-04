#import sys
#sys.path.append('./bottle.py')

import json
import collections
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

@app.route('/owasp/project', method=['POST'])
def upload():
    upload = request.files['uploadfile']
    import os
    import shutil
    import tempfile
    temp_dir = tempfile.mkdtemp()
    upload.save(temp_dir)
    scanner.scan(os.path.join(temp_dir, upload.filename))
    shutil.rmtree(temp_dir)
    return 'Upload OK!'

@app.route('/owasp/project', method=['GET'])
def owasp():
    contents = []
    for project_id, project in scanner.get_projects().items():
        p = collections.OrderedDict()
        p["project_id"] = project_id
        p["name"] = project["project"]
        dep_count = len(project["dependencies"])
        vuln_count = 0
        for dependency in project["dependencies"]:
            vuln_count += len(dependency["vulnerabilities"])
        p["dependencies"] = dep_count
        p["vulnerabilities"] = vuln_count
        contents.append(p)
    return json.dumps(contents)

@app.route('/owasp/running')
def pending():
    return json.dumps(scanner.get_running())

@app.route('/owasp/project/<project_id>')
def get_project_details(project_id):
    return json.dumps(scanner.get_dependencies(project_id))

@app.route('/owasp/project/<project_id>/dependency/<dependency_id>')
def get_dependency(project_id, dependency_id):
    return json.dumps(scanner.get_dependency(project_id, dependency_id))

@app.route('/')
def hello():
    f = open('static/index.html')
    contents = f.read()
    f.close()
    return contents

import scanner
scanner = scanner.OWASP()
run(app, host='localhost', port=8080, debug=True)
