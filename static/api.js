function loadPage(name) {
    return $.getScript('static/pages/' + name + '.js');
};

function getRunning() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/running",
    });
};

function cancelRunning(project_id) {
    return $.ajax({
        type: 'DELETE', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/running/' + project_id,
    });
}

function getProjects(page) {
    if (typeof page === "undefined") {
        page = "1";
    }
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/projects/" + page ,
    });
};

function getProject(project_id) {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/project/" + project_id,
    });
};

function getProjectDependency(project_id, dependency_id) {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/project/" + project_id + "/dependencies/" + dependency_id,
    });
};

function postProject(project_id, state, comment) {
    return $.ajax({
        type: 'POST', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/project',
        contentType: 'application/json',
        data: JSON.stringify({review: [project_id, state, comment]})
    });
};

function deleteProject(project_id) {
    return $.ajax({
        type: 'DELETE', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/project/' + project_id,
    });
};

function getFalsePositive() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/falsepositives',
    });
};

function getDependency(dependency_id) {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/dependencies/' + dependency_id,
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

function deleteFalsePositive(dependency_id, cve) {
    return $.ajax({
        type: 'DELETE', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/falsepositives/' + dependency_id + '/cve/' + cve,
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
