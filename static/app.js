var webapp = "http://localhost:8080";

function renderPage(anchor) {
    var target = "#dashboard";
    if (anchor) {
        target = anchor.target.hash;
    } else if (window.location.hash) {
        target = window.location.hash;
    }
    target = target.substring(1);

    if (target == "") { return; };

    var content = document.getElementById("content");
    loadPage(target).success(function (data, statusText, statusCode) {
        render(content);
    });
}
