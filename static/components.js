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
                if (response.length == 0 && badge.html() == 0) { badge.slideUp();
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

var tplDependency = function (parentElement, data) {
    getTemplate("vulnerabilities", function (tpl) {
        parentElement.appendChild(jsRender(tpl, data));
        // Please note: I'm not proud of the code below at all. We should
        // be using a data binding framework to make this alot more
        // maintainable.
        $('tr#expand' + data.project_id + ' div#dep' + data.dependency_id + ' button.falsepositive').on('click', function (e) {
            var project_id = $($(this).parents('.collapse')[0])[0].id;
            var fpButton = $(this);
            postFalsePositive(data.dependency_id, $(fpButton).attr("cve")).success(function (response) {
                fpButton.closest('.panel').slideUp(); 
                var vulns = $($('#row' + project_id + ' > td.vulnerabilities')[0]).text() - 1;
                var fps = parseInt($($('#row' + project_id + ' > td.falsepositives')[0]).text()) + 1;
                // Update the counts on the Projects view
                $($('#row' + project_id + ' > td.vulnerabilities')[0]).text(vulns);
                $($('#row' + project_id + ' > td.falsepositives')[0]).text(fps);

                // If there are no more vulnerabilities, hide the div.well which is
                // holding the list of vulnerabiltiies.
                if (vulns == 0) {
                    fpButton.parents('.well').slideUp();
                    $($('#row' + project_id + ' td button.btn-info')[0]).attr("disabled", "disabled");
                }
            });
        });
    });
};
