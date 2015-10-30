var webapp = "http://localhost:8080";

function renderPage(anchor) {
    if (anchor == undefined) {
        $('nav.navbar ul li a#default').trigger("click");
        return;
    }

    switch (anchor.target.hash) {
        case "#Home":
            break;
        case "#pending":
            var content = document.getElementById("content");
            content.innerHTML = "";
            var table = document.createElement("table");
            content.appendChild(table);
            table.className = "table table-striped table-hover";
            getPending().success(function (json_response) {
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
                        if (cell.match(/medium/i)) {
                            td.className = "warning";
                        } else if (cell.match(/critical/i)) {
                            td.className = "danger";
                        }
                        td.innerHTML = cell;
                    }); 
                    var td = tr.insertCell();
                    td.innerHTML = '<button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#review">Review</button>';
                    tr.appendChild(html_modal('review', row));
                });
            });
            break;
        case "#history":
            var content = document.getElementById("content");
            content.innerHTML = "";
            var table = document.createElement("table");
            content.appendChild(table);
            table.className = "table table-striped table-hover";
            getHistory().success(function (json_response) {
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
                        if (cell.match(/medium/i)) {
                            td.className = "warning";
                            td.innerHTML = cell;
                        } else if (cell.match(/critical/i)) {
                            td.className = "danger";
                            td.innerHTML = cell;
                        } else if (cell.match(/Accepted/i)) {
                            td.innerHTML = '<a href="#" class="btn btn-large btn-success" disabled="disabled">Accepted</a>';
                        } else if (cell.match(/Rejected/i)) {
                            td.innerHTML = '<a href="#" class="btn btn-large btn-danger" disabled="disabled">Rejected</a>';
                        } else {
                            td.innerHTML = cell;
                        }
                    }); 
                });
            });
            break;
        case "#admin":
            var content = document.getElementById("content");
            content.innerHTML = "";

            // primary success info warning danger

            var accept_all = document.createElement("a");
            content.appendChild(accept_all);
            accept_all.href = "#";
            accept_all.className = "btn btn-large btn-block btn-primary";
            accept_all.text = "Accept all pending reviews";

            var reject_all = document.createElement("a");
            content.appendChild(reject_all);
            reject_all.href = "#";
            reject_all.className = "btn btn-large btn-block btn-success";
            reject_all.text = "Reject all pending reviews";
            break;
    }
}

function getPending() {
    return $.ajax({
        type: 'GET',
        url: webapp + "/pending",
        cache: 'false',
        dataType: 'json'
    });
}

function getHistory() {
    return $.ajax({
        type: 'GET',
        url: webapp + "/history",
        cache: 'false',
        dataType: 'json'
    });
}

function html_modal(identifier, data) {
    var modal_div = document.createElement("div");
    $(modal_div).attr({
        'id': identifier,
        'class': 'modal fade',
        'role': 'dialog',
    });

    var dialog = document.createElement("div");
    $(dialog).attr({
        'class': 'modal-dialog'
    });

    var content = document.createElement("div");
    $(content).attr({
        'class': 'modal-content'
    });

    var header = document.createElement("div");
    $(header).attr({
        'class': 'modal-header'
    });
    var h_button = document.createElement("button");
    $(h_button).attr({
        'type': 'button',
        'class': 'close',
        'data-dismiss': 'modal',
        'value': '&times;'
    });

    var h_title = document.createElement("h4");
    $(h_title).attr({
        'class': 'modal-title',
    });
    h_title.innerHTML = 'Comment';

    var h_file = document.createElement("h6");
    h_file.innerHTML = data[0] + ' <small>' + data[1] + '</small>';

    var h_severity = document.createElement("h6");
    h_severity.innerHTML = data[2];

    var h_vulnerabilities = document.createElement("h6");
    h_vulnerabilities.innerHTML = data[3] + ' ' + data[4];

    var body = document.createElement("div");
    $(body).attr({
        'class': 'modal-body'
    });

    var b_text = document.createElement("textarea");
    $(b_text).attr({
        'class': 'form-control',
        'placeholder': 'Some comment...'
    });

    var footer = document.createElement("div");
    $(footer).attr({
        'class': 'modal-footer'
    });

    var f_button_reject = document.createElement("button");
    $(f_button_reject).attr({
        'type': 'button',
        'class': 'btn btn-danger',
        'data-dismiss': 'modal'
    });
    f_button_reject.innerHTML = 'Reject';

    var f_button_accept = document.createElement("button");
    $(f_button_accept).attr({
        'type': 'button',
        'class': 'btn btn-success',
        'data-dismiss': 'modal'
    });
    f_button_accept.innerHTML = 'Accept';

    modal_div.appendChild(dialog);
        dialog.appendChild(content);
            content.appendChild(header);
                header.appendChild(h_button);
                header.appendChild(h_title);
                header.appendChild(h_file);
                header.appendChild(h_severity);
                header.appendChild(h_vulnerabilities);
            content.appendChild(body);
                body.appendChild(b_text);
            content.appendChild(footer);
                footer.appendChild(f_button_reject);
                footer.appendChild(f_button_accept);

    return modal_div;
}
