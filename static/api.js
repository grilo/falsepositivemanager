function getRunning() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/running",
    });
};

function getProjects() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/projects",
    });
};

function getProject(project_id) {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/projects/" + project_id,
    });
};

function getDependency(project_id, dependency_id) {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/projects/" + project_id + "/dependencies/" + dependency_id,
    });
};

function postProject(project_id, state, comment) {
    return $.ajax({
        type: 'POST', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/projects',
        contentType: 'application/json',
        data: JSON.stringify({review: [project_id, state, comment]})
    });
};

function getFalsePositive() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/falsepositives',
    });
};

function postFalsePositive(dependency_id, cve) {
    return $.ajax({
        type: 'POST', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/falsepositives',
        contentType: 'application/json',
        data: JSON.stringify({
            'dependency_id': dependency_id,
            'cve': cve,
        }),
    });
};

function getDatabase() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/dump',
    });
};

function getTemplate(name, callback) {
    return $.get('static/templates/' + name + '.jsr', function(data) {
        var tpl = $.templates(data);
        callback(tpl);
    });
};
