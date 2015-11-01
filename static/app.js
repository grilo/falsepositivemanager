var webapp = "http://localhost:8080";

function renderPage(anchor) {
    if (anchor == undefined) {
        $('nav.navbar ul li a#default').trigger("click");
        return;
    }

    var content = document.getElementById("content");
    content.innerHTML = "";

    switch (anchor.target.hash) {
        case "#Home":
            break;

        case "#submit":
            var bform = new BForm("Upload");
            bform.addUpload("Upload file", "Choose a file to be uploaded");
            content.appendChild(bform.toHTML());
            break;
        case "#pending":
            getPending().success(function (response) {
                var jtable = new JSONTable(response.data, response.header)
                var table = jtable.toHTML(function (tr) {
                    // Insert Action into the table header
                    if (tr.parentElement.nodeName == "THEAD") {
                        tr.insertCell().innerHTML = "Action";
                    } else {
                        // Otherwise just place a review button
                        var td = tr.insertCell();
                        // We know the ID is the first cell
                        var id = tr.getElementsByTagName('td')[0].innerHTML;
                        td.appendChild(review_button(id));
                    }
                }, function (td) {
                    // Color code according to severity
                    if (td.innerHTML.match(/medium/i)) {
                        td.className = "warning";
                    } else if (td.innerHTML.match(/critical/i)) {
                        td.className = "danger";
                    }
                });
                table.className = "table table-striped table-hover";
                content.appendChild(table);
            });
            break;
        case "#history":
            getHistory().success(function (response) {
                var jtable = new JSONTable(response.data, response.header)
                var table = jtable.toHTML(function (tr) {
                    return;
                }, function (td) {
                    // Color code according to severity
                    if (td.innerHTML.match(/medium/i)) {
                        td.className = "warning";
                    } else if (td.innerHTML.match(/critical/i)) {
                        td.className = "danger";
                    } else if (td.innerHTML.match(/Accepted/i)) {
                            td.innerHTML = '<a href="#" class="btn btn-large btn-success" disabled="disabled">Accepted</a>';
                    } else if (td.innerHTML.match(/Rejected/i)) {
                        td.innerHTML = '<a href="#" class="btn btn-large btn-danger" disabled="disabled">Rejected</a>';
                    }
                });
                table.className = "table table-striped table-hover";
                content.appendChild(table);
            });
            break;
        case "#admin":
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
