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
            postFalsePositive(data.dependency_id, $(this).attr("cve"));
            // This is jquery werdiness for me. Since the selector
            // .parents() returns HTML, we have to envelope
            // everything in a $() to transform it into a jquery
            // object so we can fade it out.
            $($(this).parents('.panel')[0]).slideUp(); 
            var vulns = $($('#row' + project_id + ' > td.vulnerabilities')[0]).text() - 1;
            var fps = parseInt($($('#row' + project_id + ' > td.falsepositives')[0]).text()) + 1;
            // Update the counts on the Projects view
            $($('#row' + project_id + ' > td.vulnerabilities')[0]).text(vulns);
            $($('#row' + project_id + ' > td.falsepositives')[0]).text(fps);

            // If there are no more vulnerabilities, hide the div.well which is
            // holding the list of vulnerabiltiies.
            var divWell = $(this).parents('.well');
            // Count the total number of vulnerabilities
            var totalCount = $(divWell.children()[0]).children().length;
            // Count the vulnerabilities still being shown. Set this number
            // to two since: the last click isn't registered and we have
            // one extra which is the p.lead which we don't ignore to avoid
            // putting here even more code.
            var displayed = 2;
            $(divWell.children()[0]).children().each(function () {
                if ($(this).css("display") == "none") {
                    displayed += 1;
                };
            });
            if (displayed == totalCount) {
                divWell.slideUp();
            };
        });
    });
};
