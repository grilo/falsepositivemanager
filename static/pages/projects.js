var render = function (rootElement) {
    getProjects().success(function (response) {
        // Sort by date, latest first
        response.sort(function(a, b){
            return a.date < b.date;
        });

        // Convert the epoch date into something human readable
        response.forEach(function (project) {
            project.date = dateEpochToHuman(project.date);
        });

        getTemplate("projects", function (tpl) {
            var tplData = {
                "title": "Projects",
                "object": response,
            };
            var node = jsRender(tpl, tplData);
            rootElement.empty();
            rootElement.append(node);

            var $rows = $('#projectstable tr');
            $('#projectssearch').keyup(function() {
                var val = '^(?=.*\\b' + $.trim($(this).val()).split(/\s+/).join('\\b)(?=.*\\b') + ').*$',
                    reg = RegExp(val, 'i'),
                    text;

                $rows.show().filter(function() {
                    text = $(this).text().replace(/\s+/g, ' ');
                    return !reg.test(text);
                }).hide();
            });

            // Preload everything, ensuring our buttons are correctly
            // bound to their corresponding target.
            node.find("button").each(function (buttonList) {
                expandId = $(this).data("target");
                var expandElement = $(expandId);
                getProject(expandElement.attr("id")).success(function (response) {
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
};

var tplDependency = function (parentElement, data) {
    getTemplate("vulnerabilities", function (tpl) {
        parentElement.append(jsRender(tpl, data));
        var pId = data.project_id;
        var dId = data.dependency_id;
        // Please note: I'm not proud of the code below at all. We should
        // be using a data binding framework to make this alot more
        // maintainable.
        $('tr#expand' + pId + ' div#dep' + dId + ' button.falsepositive').on('click', function (e) {
            var pId = $($(this).parents('.collapse')[0])[0].id;
            var fpButton = $(this);
            postFalsePositive(dId, $(fpButton).attr("cve")).success(function (response) {
                // Hide the vulnerability that was just clicked
                fpButton.closest('.panel').slideUp();

                // Update the counts on the Projects view
                var vulnTD = $($('#row' + pId + ' > td.vulnerabilities')[0])
                var vulns = parseInt(vulnTD.text()) - 1;
                vulnTD.text(vulns);

                var fpTD = $($('#row' + pId + ' > td.falsepositives')[0]);
                var fps = parseInt(fpTD.text()) + 1;
                fpTD.text(fps);

                // If there are no more vulnerabilities, hide the vulnerability
                // container (div.well)
                if ($('#dep' + dId + ' div.panel.panel-default:visible').length <= 1) {
                    fpButton.parents('.well').slideUp();
                }

                // If the total number of vulnerabilities reached 0, also
                // disable the expand button
                if (vulns == 0) {
                    var expandButton = $($('#row' + pId + ' td button.btn-info')[0])
                    expandButton.attr("disabled", "disabled");
                }
            });
        });
    });
};
