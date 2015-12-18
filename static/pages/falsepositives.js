var render = function (rootElement) {
    getFalsePositive().success(function (response) {
        getTemplate("falsepositives", function (tpl) {
            response.forEach(function (fpRule) {
                fpRule.date = dateEpochToHuman(fpRule.date);
            });
            var tplData = {
                "title": "False Positives",
                "object": response,
            };
            var node = jsRender(tpl, tplData);
            rootElement.innerHTML = "";
            rootElement.appendChild(node);

            $('tr td button').each(function (button) {
                $(this).on("click", function (e) {
                    button = $(this);
                    id = $($(this)[0]).attr("id");
                    cve = $($(this)[0]).attr("cve");
                    deleteFalsePositive(id, cve).success(function (response) {
                        button.closest('tr').fadeOut();
                    });
                });
            });
        });
    });
};
