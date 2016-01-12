var webapp = "http://localhost:8080";
$(window).ready(function (e) {
    $('ul li a').on('click', function (e) {
        var anchor = this;
        renderPage(anchor);
    });
});

function renderPage(anchor) {

    var target = "dashboard";
    var options = [];

    if (anchor.hash) {
        var splitted = anchor.hash.split("/");
        splitted.shift(); // Remove the # used for short-circuiting browsers
        splitted.shift(); // Remove /owasp/
        target = splitted.shift();
        options = splitted;
    }

    loadPage(target).success(function (data, statusText, statusCode) {
        render($('#content'), options);
    });

}
