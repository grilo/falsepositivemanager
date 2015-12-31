var render = function (rootElement) {
    var t = new TaskList(rootElement);
    t.update();
    taskScheduler.add("tasklist", t.update.bind(t), 3000);
};
