var ProjectList = function (rootElement, properties) {
    this.rootElement = rootElement;
    if (properties === undefined) {
        properties = {};
    }
    this.properties = properties;
    this.projects = {};
    this.node = "";

    var self = this;
    getTemplate("projectList", function (tpl) {
        self.node = jsRender(tpl, self.properties);
        self.rootElement.empty();
        self.rootElement.append(self.node);

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
    });
};

ProjectList.prototype.update = function () {
    var self = this;
    getProjects().success(function (response) {
        // Sort by date, latest first
        response.sort(function(a, b){
            return a.date < b.date;
        });

        // Convert the epoch date into something human readable
        response.forEach(function (project) {
            project.date = dateEpochToHuman(project.date);
            var newProject = new Project($('table#projectstable tbody'), project);
            newProject.update();
            self.projects[project.project_id] = newProject;
        });

    });
};

var Project = function (rootElement, properties) {
    this.rootElement = rootElement;
    this.properties = properties;
    this.node = "";
    this.dependencies = {};

    var self = this;
    getTemplate("project", function (tpl) {
        self.node = jsRender(tpl, self.properties);
        self.rootElement.append(self.node);
    });
};

Project.prototype.update = function () {
    var self = this;
    getProject(this.properties.project_id).success(function (response) {
        response.forEach(function (dependency) {
            // Only show the results which actually have vulnerabilities
            // to avoid cluttering the UI
            if (dependency.vulnerabilities.length > 0 ) {
                var e = $('table#projectstable tbody tr#expand' + self.properties.project_id + ' td div');
                var newDependency = new Dependency(e, dependency);
                self.dependencies[dependency.dependency_id] = newDependency;
            }
        });
    });
};

var Dependency = function (rootElement, properties) {
    this.rootElement = rootElement;
    this.properties = properties;
    this.node = "";

    var self = this;
    getTemplate("dependency", function (tpl) {
        self.node = jsRender(tpl, self.properties);
        self.rootElement.append(self.node);

        $(self.node).find('button').on('click', function (e) {
            var button = $(e.currentTarget);
            var dependencyId = self.properties.dependency_id;
            var projectId = button.closest('tr').attr('id').substr(6);
            var cve = button.attr("cve");

            // Please note: I'm not proud of the code below at all. We should
            // be using a data binding framework to make this alot more
            // maintainable.
            postFalsePositive(dependencyId, cve).success(function (response) {
                button.closest('.panel').slideUp();
                // Update the counts on the Projects view
                var vulnTD = $($('#row' + projectId + ' > td.vulnerabilities')[0])
                var vulns = parseInt(vulnTD.text()) - 1;
                vulnTD.text(vulns);

                var fpTD = $($('#row' + projectId + ' > td.falsepositives')[0]);
                var fps = parseInt(fpTD.text()) + 1;
                fpTD.text(fps);

                // If there are no more vulnerabilities, hide the vulnerability
                // container (div.well)
                if ($('#dep' + dependencyId + ' div.panel.panel-default:visible').length <= 1) {
                    button.parents('.well').slideUp();
                }

                // If the total number of vulnerabilities reached 0, also
                // disable the expand button
                if (vulns == 0) {
                    var expandButton = $($('#row' + projectId + ' td button.btn-info')[0])
                    expandButton.attr("disabled", "disabled");
                }

            });
        });

    });
};
