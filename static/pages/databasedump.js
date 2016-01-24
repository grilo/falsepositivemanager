var render = function (rootElement) {
    getDatabase().success(function (response) {
        rootElement.html('<pre>' + JSON.stringify(response, null, 4) + '</pre>');
    });
};
