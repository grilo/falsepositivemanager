var t;
var render = function (rootElement) {
    t = new TaskList(rootElement);
    t.update();
};

$(document).ready(function () {
    (function updateRunningTasks(){
        setTimeout(function(){
            t.update();
            updateRunningTasks();
        }, 3000);
    })();
});
