var TaskScheduler = function () {
    this.tasks = {};
};

TaskScheduler.prototype.getEpoch = function () {
    return Math.floor(new Date());
};

TaskScheduler.prototype.add = function (id, callback, frequency) {
    this.tasks[id] = {
        'callback': callback,
        'frequency': frequency,
        'lastExecuted': 0,
    };
};

TaskScheduler.prototype.run = function () {
    var currentTime = this.getEpoch();
    var tasksLen = this.tasks.length;
    for (t in this.tasks) {
        var delta = currentTime - this.tasks[t].lastExecuted;
        if (delta >= this.tasks[t]['frequency']) {
            this.tasks[t]['callback']();
            this.tasks[t]['lastExecuted'] = currentTime;
        }
    }
};

var taskScheduler = new TaskScheduler();

$(document).ready(function () {
    (function updateRunningTasks(){
        setTimeout(function(){
            taskScheduler.run();
            updateRunningTasks();
        }, 1000);
    })();
});

