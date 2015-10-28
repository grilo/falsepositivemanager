var webapp = "http://localhost:8080";

function renderPage(anchor) {
    if (anchor == undefined) {
        $('div#navbar ul li a#default').trigger("click");
        return;
    }

    switch (anchor.target.hash) {
        case "#Home":
            console.log("Home Case");
            break;
        case "#DEV":
            var obj = list("dev");
            obj.success(function (data) {
                console.log("XXX");
                console.log(data[0].env)
                console.log(data);
                console.log('helloworld');
                //console.log("ENV IS: " + json[0].env);
            });
            console.log("DEV case");
            break;
    }
    //var hash = window.location.hash.substr(1);
    //console.log(hash);
}

//function list(cb, environment) {
function list(environment) {
    return $.ajax({
        type: 'GET',
        url: webapp + "/applications/list/" + environment,
        cache: 'false',
        dataType: 'json'
    });
}

/*
function get_latest_version(cb, environment, version, app) {
        if (version == "") {
            version = "latest";
        }
        $.ajax({
            url : webapp + "/applications/list/" + environment + "/" + version + "/" + app,
            data: json,
            type: 'GET',
            cache: 'false',
            success: cb(json)
        });
}

function get_status(cb, environment, version, app) {
        $.ajax({
            url : webapp + "/applications/status/" + environment + "/" + version + "/" + app,
            ersion" + app,
            data: json,
            type: 'GET',
            cache: 'false',
            success: json
        });
}

function deploy(cb, environment, version, app) {
        $.ajax({
            url : webapp + "/applications/deploy/" + environment + "/" + version + "/" + app,
            data: json,
            type: 'POST',
            cache: 'false',
            success: cb(json)
        });
}

function cancel(cb, environment, version, app) {
        $.ajax({
            url : webapp + "/applications/cancel/" + environment + "/" + version + "/" + app,
            data: json,
            type: 'POST',
            cache: 'false',
            success: cb(json)
        });
}
*/
