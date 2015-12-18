var render = function (rootElement) {
    getDatabase().success(function (response) {
        rootElement.innerHTML = '<pre>' + JSON.stringify(response, null, 4) + '</pre>';
    });
};
