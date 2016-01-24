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
            rootElement.empty();
            rootElement.append(node);

            $('tr td button').each(function (button) {
                $(this).on("click", function (e) {
                    button = $(this);
                    id = $(this).closest('tr').attr('id');
                    deleteFalsePositive(id).success(function (response) {
                        button.closest('tr').fadeOut();
                    });
                });
            });
        });
    });
};
