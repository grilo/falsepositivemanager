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
        case "#pending":
            console.log("hello world");
            var obj = pending();
            obj.success(function (json_response) {
                var table = document.getElementById("pending");
                table.innerHTML = "";
                var th = table.createTHead();
                var tr = th.insertRow();
                json_response.header.forEach(function(header) {
                    var td = tr.insertCell();
                    td.innerHTML = header;
                });

                json_response.data.forEach(function(row) {
                    var tr = table.insertRow();
                    row.forEach(function(cell) {
                        var td = tr.insertCell();
                        td.innerHTML = cell;
                    }); 
                    var td = tr.insertCell();
                    td.innerHTML = '<a href="#" class="btn btn-large btn-success">Accept</a>\n<a href="#" class="btn btn-large btn-danger">Reject</a>';
                });
            });
            break;
    }
}

function list(environment) {
    return $.ajax({
        type: 'GET',
        url: webapp + "/applications/list/" + environment,
        cache: 'false',
        dataType: 'json'
    });
}

function pending() {
    return $.ajax({
        type: 'GET',
        url: webapp + "/pending",
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
