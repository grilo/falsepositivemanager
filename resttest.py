#import sys
#sys.path.append('./bottle.py')

import json
from bottle import Bottle, route, run, request, response, static_file, get

app = Bottle()

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

@app.route('/pending')
def pending():
    contents = {
        "header": [
            "File", "md5", "Severity", "CVE", "CWE"
        ],
        "data": [
            [
                "mailapi-1.5.4.jar",            
                "f453b447b089abb4c93fc210f67cd09f",            
                "Medium (5.0)",
                "CVE-2007-6059",
                "CWE-399 Resource Management Errors",
            ],
            [
                "mailapi-1.5.4.jar",            
                "f453b447b089abb4c93fc210f67cd09f",            
                "Critical (1.0)",
                "CVE-2007-6059",
                "CWE-399 Resource Management Errors",
            ],
        ]
    }
    return json.dumps(contents)

@app.route('/')
def hello():
    f = open('index.html')
    contents = f.read()
    f.close()
    return contents

@app.route('/applications/list/<env>', method=['GET', 'OPTIONS'])
def list(env):
    from json import dumps
    rv = [{ "env": env }]
    response.content_type = 'application/json'
    return json.dumps(rv)

@app.route('/deploy/status/<env>/<app>')
def deploy_status(env, app):
    return "Requested status for %s in environment %s" % (app, env)
@app.route('/deploy/start/<env>/<app>', method='POST')
@app.route('/deploy/start/<env>/<app>', method='OPTIONS')
def deploy_start(env, app):
    print('x')
    if request.method == 'OPTIONS':
        print('y')
        return {}
    print('z')
    import time
    time.sleep(3)
    return "Status for %s in env %s" % (app, env)
@app.route('/deploy/stop/<env>/<app>')
def deploy_stop(env, app):
    return "Aborting %s in env %s" % (app, env)

run(app, host='localhost', port=8080, debug=True)
