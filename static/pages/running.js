var render = function (rootElement) {
    var t = new TaskList(rootElement);
    taskScheduler.add(3000, t.update);
};
