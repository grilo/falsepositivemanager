var Chart = function (parentElementId) {
    this.parentElementId = parentElementId;
    this.data = [];
    this.labels = [];
    this.x = [];
    this.chart;
};

Chart.prototype.getDefaultConfig = function () {
    return {
        element: this.parentElementId,
        data: this.data,
        xkey: 'x',
        ykeys: this.labels,
        labels: this.labels,
        hideHover: 'auto',
        resize: true,
    };
};

Chart.prototype.setX = function (data) {
    this.x = data;
};

Chart.prototype.addData = function (label, data) {
    this.labels.push(label);
    for (var i = 0, len = this.x.length; i < len; i++) {
        var dataPoint = this.data[i] || {};
        dataPoint['x'] = this.x[i];
        dataPoint[label] = data[i];
        this.data[i] = dataPoint;
    }
};

Chart.prototype.renderLine = function () {
    config = this.getDefaultConfig();
    config.fillOpacity = 0.3;
    config.opacity = 0.5;
    config.behaveLikeLine = true;
    return new Morris.Line(config);
};

Chart.prototype.renderArea = function () {
    config = this.getDefaultConfig();
    config.fillOpacity = 0.3;
    config.opacity = 0.5;
    config.behaveLikeLine = true;
    return new Morris.Area(config);
};

Chart.prototype.renderAreaStacked = function () {
    config = this.getDefaultConfig();
    config.fillOpacity = 0.3;
    config.opacity = 0.5;
    return new Morris.Area(config);
};

Chart.prototype.renderBar = function () {
    config = this.getDefaultConfig();
    return new Morris.Bar(config);
};

Chart.prototype.renderBarStacked = function () {
    config = this.getDefaultConfig();
    config.stacked = true;
    return new Morris.Bar(config);
};

Chart.prototype.renderDonut = function () {
    config = this.getDefaultConfig();
    //config = {}
    //config.element = this.parentElementId;
    config.data = []
    for (var i = 0, len = this.data.length; i < len; i++) {
        var dataPoint = {};
        dataPoint['label'] = this.data[i]['x'];
        dataPoint['value'] = this.data[i][this.labels[0]];
        config.data.push(dataPoint);
    }
    return new Morris.Donut(config);
};
