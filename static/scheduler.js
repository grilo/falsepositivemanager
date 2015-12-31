var TaskScheduler = function () {
    this.tasks = [];
};

TaskScheduler.prototype.getEpoch = function () {
    return Math.floor(new Date());
};

TaskScheduler.prototype.add = function (frequency, callback) {
    this.tasks.push({
        'frequency': frequency,
        'callback': callback,
        'lastExecuted': 0,
    });
};

TaskScheduler.prototype.run = function () {
    var currentTime = this.getEpoch();
    var tasksLen = this.tasks.length;
    for (var i = 0; i < tasksLen; i++) {
        var delta = currentTime - this.tasks[i].lastExecuted;
        if (delta >= this.tasks[i]['frequency']) {
            this.tasks[i]['callback']();
            this.tasks[i]['lastExecuted'] = currentTime;
        }
    }
};

var taskScheduler = new TaskScheduler();

$(document).ready(function () {
    (function updateRunningTasks(){
        setTimeout(function(){
            taskScheduler.run();
            updateRunningTasks();
        }, 3000);
    })();
});

