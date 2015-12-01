var webapp = "http://localhost:8080";

function renderPage(anchor) {
    var target = "#dashboard";
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

        case "#dashboard":
            getHistory().success(function (response) {

                getTemplate("dashboard", function (tpl) {
                    var node = jsRender(tpl, {"title": "Dashboard"});
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
                content.appendChild(node);

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
                    var node = jsRender(tpl, tplData);
                    content.appendChild(node);
                });
            });
            break;
        case "#history":
            getHistory().success(function (response) {

                getTemplate("history", function (tpl) {
                    var tplData = {
                        "title": "History",
                        "object": response,
                    };
                    var node = jsRender(tpl, tplData);
                    content.appendChild(node);

                    // Preload everything, ensuring our buttons are correctly
                    // bound to their corresponding target.
                    var buttonList = node.getElementsByTagName("button")
                    Array.prototype.forEach.call(buttonList, function (button) {
                        expandId = button.getAttribute("data-target").substr(1);
                        var expandElement = document.getElementById(expandId);
                        getItem(expandElement.id).success(function (response) {
                            // Preprocess the information, extract whatever has and doesn't
                            // have vulnerabilities in two separate lists
                            sortedDependencies = []
                            response.dependencies.forEach(function(dependency) {
                                if (dependency.vulnerabilities.length > 0) {
                                    sortedDependencies.unshift(dependency);
                                } else {
                                    sortedDependencies.push(dependency);
                                }
                            });
                            sortedDependencies.forEach(function(dependency) {
                                tplDependency(expandElement, dependency);
                            });
                        });
                    }); // End of preload
                });
            });
            break;
        case "#admin":
            var panel = document.createElement("div");
            panel.innerHTML = "<h1>Hello world</h1>";
            content.appendChild(panel);
            break;
    }
}
