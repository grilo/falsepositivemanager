var render = function (rootElement) {
    getProjects().success(function (response) {
        getTemplate("dashboard", function (tpl) {
            var node = jsRender(tpl, {"title": "Dashboard"});
            rootElement.empty();
            rootElement.append(node);

            var chart = new Chart('chart1');
            chart.setX(['2008', '2009', '2010', '2011', '2012']);
            chart.addData('Tasks', [20, 10, 3, 12, 26]);
            chart.addData('Vulnerabilities', [2, 5, 3, 12, 8]);
            chart.renderLine();

            var chart = new Chart('chart2');
            chart.setX(['2008', '2009', '2010', '2011', '2012']);
            chart.addData('Tasks', [20, 10, 3, 12, 26]);
            chart.addData('Vulnerabilities', [2, 5, 3, 12, 8]);
            chart.renderAreaStacked();

            var chart = new Chart('chart3');
            chart.setX(['2008', '2009', '2010', '2011', '2012']);
            chart.addData('Tasks', [20, 10, 3, 12, 26]);
            chart.addData('Vulnerabilities', [2, 5, 3, 12, 8]);
            chart.renderBarStacked();

            var chart = new Chart('chart4');
            chart.setX(['John', 'Joe', 'Mary', 'Kate', 'Leigh']);
            chart.addData('Tasks', [20, 10, 3, 12, 26]);
            chart.renderDonut();
        });
    });
};
