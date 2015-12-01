var tplDependency = function (parentElement, data) {
    getTemplate("dependency", function (tpl) {
        parentElement.appendChild(jsRender(tpl, data));
    });
};
