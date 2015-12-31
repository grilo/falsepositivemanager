var TaskList = function (rootElement) {
    this.rootElement = rootElement;
    this.tasks = {};
    this.node = "";

    var self = this;
    getTemplate("running", function (tpl) {
        var tplData = {
            "title": "Running Tasks",
            "object": {},
        };
        node = jsRender(tpl, tplData);
        rootElement.empty();
        rootElement.append(node);
        self.node = $('table#running tbody');
    });
};

TaskList.prototype.update = function () {

    var self = this;
    getRunning().success(function (response) {
        // Make sure our badge is updated
        var badge = $("#runningbadge");
        if (response.length == 0 && badge.html() == 0) {
            badge.slideUp();
        } else {
            if (!badge.is(':visible')) {
                badge.fadeIn();
            }
            badge.css("display") == "none" && badge.slideDown();
            badge.html(response.length);
        }

        if (!self.node) {
            return;
        }

        if (response.length != 0) {
            $('#norunningtasks').fadeOut();
        }

        var newIds = [];
        // Create new stuff
        response.forEach(function (t) {
            if (!(t.project_id in self.tasks)) {
                var t = new RunningTask(self.node, t.project_id, t.project);
                self.tasks[t.id] = t;
            }
            newIds.push(t.project_id);
        });

        // Delete old stuff
        $(Object.keys(self.tasks)).not(newIds).get().forEach(function (oldTask) {
            self.tasks[oldTask].done();
        });
    });
};

var RunningTask = function (rootElement, id, name) {
    this.rootElement = rootElement;
    this.id = id;
    this.name = name;
    this.node = "";

    var self = this;
    getTemplate("runningTask", function (tpl) {
        var tplData = {
            "project_id": id,
            "project_name": name,
        };
        self.node = jsRender(tpl, tplData);
        self.node.fadeIn('slow');
        rootElement.prepend(self.node);
        self.node.find("button").first().on("click", function (event) {
            var element = $(event.target);
            cancelRunning(id).success(function () {
                $(element).closest('tr').fadeOut();
            });
        });
    });
};

RunningTask.prototype.done = function () {
    if (this.node) {
        var button = this.node.find("button").first();
        button.removeClass("btn-danger");
        button.addClass("btn-success");
        button.prop("disabled", true);
        button.text("Done");
    };
};
