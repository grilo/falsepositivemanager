var render = function (rootElement) {
    getRunning().success(function (response) {
        getTemplate("running", function (tpl) {
            var tplData = {
                "title": "Running Tasks",
                "object": response,
            };
            var node = jsRender(tpl, tplData);
            rootElement.empty();
            rootElement.append(node);
            //var e = $(node).find('tbody').first()
            var e = $('table#running tbody');
            response.forEach(function (obj) {
                var t = new RunningTask(obj.project_id, obj.project);
                t.render(e);
            });
        });
    });
};

$(document).ready(function () {
    (function updateRunningTasks(){
       setTimeout(function(){
            getRunning().success(function (response) {
                var badge = $("#runningbadge");
                if (response.length == 0 && badge.html() == 0) { badge.slideUp();
                } else {
                    if (!badge.is(':visible')) {
                        badge.fadeIn();
                    }
                    badge.css("display") == "none" && badge.slideDown();
                    badge.html(response.length);
                }

                if (window.location.hash == "#running") {
                    // If we're in the running window, update the list
                    var tasks = {};
                    var runningTasks = [];
                    response.forEach(function (obj) {
                        runningTasks.push(obj.project_id);
                        tasks[obj.project_id] = obj.project;
                    });

                    // Remove the tasks which are no longer running
                    $('table#running tbody tr').each(function (e) {
                        var elementId = $(this)[0].id;
                        if ($.inArray(elementId, runningTasks) == -1) {
                            $(this).fadeOut();
                        } else {
                            // Update the running tasks list so we can reuse
                            // it below to add tasks which aren't already
                            // displayed in the list.
                            var idx = runningTasks.indexOf(elementId);
                            runningTasks.splice(idx, 1);
                        }
                    });

                    // Add new tasks
                    var rootElement = $('table#running tbody');
                    runningTasks.forEach(function (id) {
                        var t = new RunningTask(id, tasks[id]);
                        t.render(rootElement);
                    });
                }
                updateRunningTasks();
            });
      }, 3000);
    })();
});
