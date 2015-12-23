$(document).ready(function () {
    $('#expandedAdmin').on('show.bs.collapse', function () {
        $(this).parent().find(".glyphicon-chevron-left").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-down");
    });

    $('#expandedAdmin').on('hidden.bs.collapse', function() {
        $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-left");
    });
});
