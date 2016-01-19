var TaskList = function (rootElement, properties) {
    this.rootElement = rootElement;
    if (properties === undefined) {
        properties = {};
    }
    this.properties = properties;
    this.badge = new RunningBadge($('a[href="#running"]'));
    this.tasks = {};
    this.node = "";

    var self = this;
    getTemplate("running", function (tpl) {
        node = jsRender(tpl, self.properties);
        rootElement.empty();
        rootElement.append(node);
        self.node = $('table#running tbody');
    });

};

TaskList.prototype.update = function () {
    var self = this;
    getRunning().success(function (response) {
        self.badge.setValue(response.length); // Keep our badge updated

        if (!self.node) {
            return;
        }

        if (response.length != 0) {
            $('#norunningtasks').hide();
        }

        // Create new stuff
        var newIds = [];
        response.forEach(function (t) {
            if (!(t.project_id in self.tasks)) {
                var newTask = new RunningTask(self.node, t);
                self.tasks[t.project_id] = newTask;
            }
            newIds.push(t.project_id);
        });

        // Delete old stuff
        $(Object.keys(self.tasks)).not(newIds).get().forEach(function (oldTask) {
            self.tasks[oldTask].done();
        });
    });
};

var RunningBadge = function (rootElement, properties) {
    this.rootElement = rootElement;
    this.properties = properties;
    if (!$('span#runningbadge').length) {
        rootElement.append($('<span id="runningbadge" class="badge" style="display: none;">0</span>'));
    }
    this.node = $('span#runningbadge');
};

RunningBadge.prototype.setValue = function (newValue) {
    var currentValue = this.node.html();
    if (newValue == 0 && currentValue == 0) {
        this.node.slideUp();
        return;
    }  else if (this.node.is(':visible')) {
        this.node.fadeIn();
    }
    this.node.css("display") == "none" && this.node.slideDown();
    this.node.html(newValue);
};

var RunningTask = function (rootElement, properties) {
    this.rootElement = rootElement;
    this.properties = properties;
    this.node = "";

    var self = this;
    getTemplate("runningTask", function (tpl) {
        self.node = jsRender(tpl, self.properties);
        self.node.fadeIn('slow');
        rootElement.prepend(self.node);
        self.node.find("button").first().on("click", function (event) {
            var element = $(event.target);
            var id = element.parent().parent().attr("id");
            console.log(id);
            cancelRunning(id).success(function () {
                $(element).closest('tr').fadeOut();
            });
        });
    });
};

RunningTask.prototype.done = function () {
    if (!this.node) {
        return;
    }
    var button = this.node.find("button").first();
    button.removeClass("btn-danger");
    button.addClass("btn-success");
    button.prop("disabled", true);
    button.text("Done");
};
