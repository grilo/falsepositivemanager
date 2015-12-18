var render = function (rootElement) {
    getRunning().success(function (response) {
        getTemplate("running", function (tpl) {
            var tplData = {
                "title": "Running Tasks",
                "object": response,
            };
            var node = jsRender(tpl, tplData);
            rootElement.innerHTML = "";
            rootElement.appendChild(node);
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
                    badge.css("display") == "none" && badge.slideDown();
                    badge.html(response.length);
                }

                if (window.location.hash == "#running") {
                    // If we're in the running window, update the list
                }
                //updateRunningTasks();
            });
      }, 3000);
    })();
});
