var render = function (rootElement, options) {
    var p = new ProjectList(rootElement, {page: options[0]});
    p.update();
};
