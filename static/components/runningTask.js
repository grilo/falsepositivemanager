var RunningTask = function (id, name) {
    this.id = id;
    this.name = name;
};

RunningTask.prototype.render = function (rootElement) {
    var id = this.id;
    var name = this.name;
    getTemplate("runningTask", function (tpl) {
        var tplData = {
            "project_id": id,
            "project_name": name,
        };
        var node = jsRender(tpl, tplData);
        node.fadeIn('slow');
        rootElement.append(node);
        $('#' + id + ' button').on("click", function (event) {
            var element = $(event.target);
            cancelRunning(id).success(function () {
                $(element).closest('tr').fadeOut();
            });
        });
    });
};
