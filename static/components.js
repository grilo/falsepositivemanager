$(document).ready(function () {
    $('#expandedAdmin').on('show.bs.collapse', function () {
        $(this).parent().find(".glyphicon-chevron-left").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-down");
    });

    $('#expandedAdmin').on('hidden.bs.collapse', function() {
        $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-left");
    });
});

$(document).ready(function () {
    (function updateRunningTasks(){
       setTimeout(function(){
            getRunning().success(function (response) {
                var badge = $("#runningbadge");
                if (response.length == 0 && badge.html() == 0) {
                    badge.slideUp();
                } else {
                    badge.css("display") == "none" && badge.slideDown();
                    badge.html(response.length);
                }

                if (window.location.hash == "#running") {
                    // If we're in the running window, update the list
                }
                //updateRunningTasks();
            });
      }, 3000);
    })();
});

$(document).ready(function () {
    $('#modaldialog').on('show.bs.modal', function (event) {
        var request = $(event.relatedTarget)[0].pathname.split("/");
        var modal = document.getElementById('modaldialog');
        var dependency = getDependency(request[3], request[5]).success(function (dependency) {
            modal.innerHTML = "";
            getTemplate("modal", function (tpl) {
                console.log(dependency);
                modal.appendChild(jsRender(tpl, dependency));
                // Can only bind the click event when we are sure
                // the element has been rendered. Which means chaining
                // these functions non-stop.
                $('.falsepositive').on('click', function (e) {
                    postFalsePositive(request[5], $(this).attr("cve"));
                    // This is jquery werdiness for me. Since the selector
                    // .parents() returns HTML, we have to envelope
                    // everything in a $() to transform it into a jquery
                    // object so we can fade it out.
                    $($(this).parents('.panel')[0]).slideUp();
                });
            });
        });
    });
});

var tplDependency = function (parentElement, data) {
    getTemplate("vulnerabilities", function (tpl) {
        parentElement.appendChild(jsRender(tpl, data));
        $('.falsepositive').on('click', function (e) {
            postFalsePositive(data.dependency_id, $(this).attr("cve"));
            // This is jquery werdiness for me. Since the selector
            // .parents() returns HTML, we have to envelope
            // everything in a $() to transform it into a jquery
            // object so we can fade it out.
            $($(this).parents('.panel')[0]).slideUp();
        });
    });
};
