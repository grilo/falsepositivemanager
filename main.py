#import sys
#sys.path.append('./bottle.py')

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
 

@app.route('/<filename:re:.*\.(css|js|jpg|png|gif|ico|ttf|eot|woff|svg)>')
def javascripts(filename):
    return static_file(filename, root='')

@app.route('/review/history')
def history():
    contents = []
    for uid, vulns in scanner.get_results().items():
        contents += vulns
    return json.dumps(contents)


@app.route('/review/running')
def pending():
    return json.dumps(scanner.get_running())

@app.route('/review/<identifier>')
def get_review_details(identifier):
    return ''

@app.route('/review/<identifier>', method=['POST', 'OPTIONS'])
def change_state(identifier):
    import time
    time.sleep(3)
    return ''

@app.route('/review', method=['POST'])
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

@app.route('/')
def hello():
    f = open('static/index.html')
    contents = f.read()
    f.close()
    return contents

import scanner
scanner = scanner.OWASP()
run(app, host='localhost', port=8080, debug=True)
