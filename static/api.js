function getRunning() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/running",
    });
};

function getHistory() {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/project",
    });
};

function getItem(project_id) {
    return $.ajax({
        type: 'GET', cache: 'false', dataType: 'json',
        url: webapp + "/owasp/project/" + project_id,
    });
};

function postReview(project_id, state, comment) {
    return $.ajax({
        type: 'POST', cache: 'false', dataType: 'json',
        url: webapp + '/owasp/project',
        contentType: 'application/json',
        data: JSON.stringify({review: [project_id, state, comment]})
    });
};

function getTemplate(name, callback) {
    return $.get('static/templates/' + name + '.jsr', function(data) {
        var tpl = $.templates(data);
        callback(tpl);
    });
};
