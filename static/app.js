var webapp = "http://localhost:8080";

function renderPage(anchor) {
    var target = "#pending";
    if (anchor) {
        target = anchor.target.hash;
    } else if (window.location.hash) {
        target = window.location.hash;
    }

    var content = document.getElementById("content");
    content.innerHTML = "";

    switch (target) {
        case "#Home":
            break;

        case "#submit":
            var panel = new UploadForm("Upload file", "Choose a file from your computer", "Choose file");
            content.appendChild(panel.toHTML());

            var errBox = document.getElementById('footertext');
            var btn = document.getElementById("upload-btn");

            var uploader = new ss.SimpleUpload({
                button: 'upload-btn', // HTML element used as upload button
                dropzone: 'main-panel',
                url: '/review', // URL of server-side upload handler
                name: 'uploadfile', // Parameter name of the uploaded file
                multipart: true,
                hoverClass: 'btn-hover',
                focusClass: 'active',
                disabledClass: 'disabled',
                responseType: 'json',

                onSubmit: function(filename, ext) {            
                        this.setProgressBar(document.getElementById('progress-bar'));
                        this.setFileSizeBox(document.getElementById('progress-percent'));
                },        
                onComplete: function(file, response, btn) {            
                    console.log(response);
                    if (!response) {
                        errBox.innerHTML = 'Unable to upload file';
                    } else {
                        errBox.innerHTML = 'Upload OK!';
                    }
                    if (response.success === true) {
                        errBox.innerHTML = 'Upload OK!';
                    } else {
                        if (response.msg)  {
                            errBox.innerHTML = response.msg;
                        } else {
                            errBox.innerHTML = 'Unable to upload file';
                        }
                    }
                }
            });

            break;
        case "#pending":
            getPending().success(function (response) {
                var panel = new BPanel();
                panel.setContext("panel-primary");
                panel.setHeader("Pending Reviews");
                panel = panel.toHTML();

                var table = new JSONTable(response.data, response.header)
                table = table.toHTML(function (tr) {
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
                panel.appendChild(table)
                content.appendChild(panel);
            });
            break;
        case "#history":
            getHistory().success(function (response) {
                var panel = new BPanel();
                panel.setContext("panel-info");
                panel.setHeader("History");
                panel = panel.toHTML();

                var table = new JSONTable(response.data, response.header)
                table = table.toHTML(function (tr) {
                    return;
                }, function (td) {
                    // Color code according to severity
                    if (td.innerHTML.match(/medium/i)) {
                        td.className = "warning";
                    } else if (td.innerHTML.match(/critical/i)) {
                        td.className = "danger";
                    } else if (td.innerHTML.match(/Accepted/i)) {
                            td.innerHTML = '<a href="' + target + '" class="btn btn-large btn-success" disabled="disabled">Accepted</a>';
                    } else if (td.innerHTML.match(/Rejected/i)) {
                        td.innerHTML = '<a href="' + target + '" class="btn btn-large btn-danger" disabled="disabled">Rejected</a>';
                    } else if (td.innerHTML.match(/Analysing/i)) {
                        td.innerHTML = '<a href="' + target + '" class="btn btn-large btn-warning" disabled="disabled">Analysing</a>';
                    }
                });
                table.className = "table table-striped table-hover";
                panel.appendChild(table);
                content.appendChild(panel);
            });
            break;
        case "#admin":
            var panel = new BPanel();
            panel.setContext("panel-danger");
            panel.setHeader("Admin");
            panel.setCaption("These changes are not reversible.");
            panel = panel.toHTML();

            var accept_all = document.createElement("a");
            panel.appendChild(accept_all);
            accept_all.href = "#";
            accept_all.className = "btn btn-large btn-block btn-primary";
            accept_all.text = "Accept all pending reviews";

            var reject_all = document.createElement("a");
            panel.appendChild(reject_all);
            reject_all.href = "#";
            reject_all.className = "btn btn-large btn-block btn-success";
            reject_all.text = "Reject all pending reviews";
            content.appendChild(panel);
            break;
    }
}
