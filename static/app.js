var webapp = "http://localhost:8080";

function renderPage(anchor) {
    var target = "#dashboard";
    if (anchor) {
        target = anchor.target.hash;
    } else if (window.location.hash) {
        target = window.location.hash;
    }

    var content = document.getElementById("content");

    switch (target) {
        case "#dashboard":
            getProjects().success(function (response) {

                getTemplate("dashboard", function (tpl) {
                    var node = jsRender(tpl, {"title": "Dashboard"});
                    content.innerHTML = "";
                    content.appendChild(node);
                    
                    var chart = new Chart('chart1');
                    chart.setX(['2008', '2009', '2010', '2011', '2012']);
                    chart.addData('Tasks', [20, 10, 3, 12, 26]);
                    chart.addData('Vulnerabilities', [2, 5, 3, 12, 8]);
                    chart.renderLine();

                    var chart = new Chart('chart2');
                    chart.setX(['2008', '2009', '2010', '2011', '2012']);
                    chart.addData('Tasks', [20, 10, 3, 12, 26]);
                    chart.addData('Vulnerabilities', [2, 5, 3, 12, 8]);
                    chart.renderAreaStacked();

                    var chart = new Chart('chart3');
                    chart.setX(['2008', '2009', '2010', '2011', '2012']);
                    chart.addData('Tasks', [20, 10, 3, 12, 26]);
                    chart.addData('Vulnerabilities', [2, 5, 3, 12, 8]);
                    chart.renderBarStacked();

                    var chart = new Chart('chart4');
                    chart.setX(['John', 'Joe', 'Mary', 'Kate', 'Leigh']);
                    chart.addData('Tasks', [20, 10, 3, 12, 26]);
                    chart.renderDonut();
                });
            });
            break;

        case "#submit":
            getTemplate("submit", function (tpl) {
                var tplData = {
                    "title": "Upload files",
                };
                var node = jsRender(tpl, tplData);
                content.innerHTML = "";
                content.appendChild(node);

                var errBox = document.getElementById('footertext');
                var btn = document.getElementById("upload-btn");

                var uploader = new ss.SimpleUpload({
                    button: 'upload-btn', // HTML element used as upload button
                    dropzone: 'main-panel',
                    url: '/owasp/projects', // URL of server-side upload handler
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

            });


            break;
        case "#running":
            getRunning().success(function (response) {
                getTemplate("running", function (tpl) {
                    var tplData = {
                        "title": "Running Tasks",
                        "object": response,
                    };
                    console.log(response);
                    var node = jsRender(tpl, tplData);
                    content.innerHTML = "";
                    content.appendChild(node);
                });
            });
            break;
        case "#projects":
            getProjects().success(function (response) {
                // Sort by date, latest first
                response.sort(function(a, b){
                    return a.date < b.date;
                });

                // Convert the epoch date into something human readable
                response.forEach(function (fpRule) {
                    var d = new Date(Math.floor(fpRule.date * 1000));
                    var datestring = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + d.getSeconds();
                    fpRule.date = datestring;
                    //fpRule.date = d.toISOString();
                });

                getTemplate("projects", function (tpl) {
                    var tplData = {
                        "title": "Projects",
                        "object": response,
                    };
                    var node = jsRender(tpl, tplData);
                    content.innerHTML = "";
                    content.appendChild(node);

                    // Preload everything, ensuring our buttons are correctly
                    // bound to their corresponding target.
                    var buttonList = node.getElementsByTagName("button")
                    Array.prototype.forEach.call(buttonList, function (button) {
                        expandId = button.getAttribute("data-target").substr(1);
                        var expandElement = document.getElementById(expandId);
                        getProject(expandElement.id).success(function (response) {
                            response.forEach(function(dependency) {
                                if (dependency.vulnerabilities.length > 0) {
                                    dependency.project_id = expandElement.id;
                                    tplDependency(expandElement, dependency);
                                }
                            });
                        });
                    }); // End of preload
                });
            });
            break;
        case "#admin":
            getTemplate("admin", function (tpl) {
                var tplData = {
                    "title": "Administration",
                };
                var node = jsRender(tpl, tplData);
                content.innerHTML = "";
                content.appendChild(node);
            });
            break;
        case "#falsepositive":
            getFalsePositive().success(function (response) {
                getTemplate("falsepositive", function (tpl) {
                    response.forEach(function (fpRule) {
                        fpRule.date = dateEpochToHuman(fpRule.date);
                    });
                    var tplData = {
                        "title": "False Positives",
                        "object": response,
                    };
                    var node = jsRender(tpl, tplData);
                    content.innerHTML = "";
                    content.appendChild(node);

                    $('tr td button').each(function (button) {
                        $(this).on("click", function (e) {
                            button = $(this);
                            id = $($(this)[0]).attr("id");
                            cve = $($(this)[0]).attr("cve");
                            deleteFalsePositive(id, cve).done(function (response) {
                                button.closest('div').slideUp();
                                //button.closest('tr').remove();
                            });
                        });
                    });
                });
            });
            break;
        case "#databasedump":
            getDatabase().success(function (response) {
                content.innerHTML = '<pre>' + JSON.stringify(response, null, 4) + '</pre>';
            });
            break;
    }
}
