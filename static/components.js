// The model is used to define the table's header
// The data is what actually fills up the table
// We also provide some functions for slightly more control over
// the actual style of the table.
var JSONTable = function (data, model) {
    this.data = data;
    this.model = model || "";
};

JSONTable.prototype.toHTML = function (cb_tr, cb_td) {
    var table = document.createElement("table");
    if (this.model) {
        var th = table.createTHead();
        var tr = th.insertRow();
        this.model.forEach(function(header) {
            td = tr.insertCell();
            td.innerHTML = header;
            cb_td(td);
        });
        cb_tr(tr);
    }

    var tb = table.createTBody();
    this.data.forEach(function(row) {
        var tr = tb.insertRow();
        row.forEach(function(cell) {
            td = tr.insertCell();
            td.innerHTML = cell;
            cb_td(td);
        });
        cb_tr(tr);
    });
    return table;
};


function review_button(identifier) {
    button = document.createElement("button");
    $(button).attr({
        'data-toggle': 'modal',
        'data-target': '#' + identifier,
        'id': 'reviewbutton' + identifier
    });

    button.className = 'btn btn-info';
    button.innerHTML = 'Review';
    $(button).click(function() {
        this.className += ' active';
    });
    body = document.body.appendChild(review_dialog(identifier));
    return button;
}

function review_dialog(identifier) {
    var modal_div = document.createElement("div");
    $(modal_div).attr({
        'id': identifier,
        'class': 'modal fade',
        'role': 'dialog'
    });

    var dialog = document.createElement("div");
    $(dialog).attr({
        'class': 'modal-dialog'
    });

    var content = document.createElement("div");
    $(content).attr({
        'class': 'modal-content'
    });

    var header = document.createElement("div");
    $(header).attr({
        'class': 'modal-header'
    });

    var h_button = document.createElement("button");
    $(h_button).attr({
        'class': 'close',
        'data-dismiss': 'modal'
    });
    h_button.innerHTML = '&times;';

    var h_title = document.createElement("h4");
    $(h_title).attr({
        'class': 'modal-title',
    });

    var h_title = document.createElement("h4");
    $(h_title).attr({
        'class': 'modal-title',
    });
    h_title.innerHTML = 'Review Analysis';

    var h_id = document.createElement("h6");
    h_id.innerHTML = 'Review ID: ' + identifier;

    var body = document.createElement("div");
    $(body).attr({
        'class': 'modal-body'
    });

    var b_text = document.createElement("textarea");
    $(b_text).attr({
        'class': 'form-control',
        'placeholder': 'A useful comment may help your colleagues understand your decision...'
    });
    b_text.id = 'comment' + identifier;

    var footer = document.createElement("div");
    $(footer).attr({
        'class': 'modal-footer'
    });

    var f_button_reject = document.createElement("button");
    $(f_button_reject).attr({
        'type': 'button',
        'class': 'btn btn-danger',
        'data-dismiss': 'modal',
    });
    f_button_reject.innerHTML = 'Reject';
    $(f_button_reject).click(function () {
        var comment = $('#comment' + identifier)[0].value;
        postReview(identifier, 'reject', comment);
        $('#reviewbutton' + identifier).removeClass('active');
    });

    var f_button_accept = document.createElement("button");
    $(f_button_accept).attr({
        'type': 'button',
        'class': 'btn btn-success',
        'data-dismiss': 'modal',
    });
    f_button_accept.innerHTML = 'Accept';
    $(f_button_accept).click(function () {
        var comment = $('#comment' + identifier)[0].value;
        postReview(identifier, 'accept', comment);
        $('#reviewbutton' + identifier).removeClass('active');
    });

    modal_div.appendChild(dialog);
        dialog.appendChild(content);
            content.appendChild(header);
                header.appendChild(h_button);
                header.appendChild(h_title);
                header.appendChild(h_id);
            content.appendChild(body);
                body.appendChild(b_text);
            content.appendChild(footer);
                footer.appendChild(f_button_reject);
                footer.appendChild(f_button_accept);

    return modal_div;
};

var BForm = function (submitText) {
    this.form = document.createElement("form");
    this.submitText = submitText || "Submit"
    this.id = 0;
};

BForm.prototype.addInput = function (header, placeholder, type) {
    this.id += 1;
    var div = document.createElement("div");
    div.className = "form-group";

    var label = document.createElement("label");
    $(label).attr({
        'for': 'input' + this.id,
    });
    label.innerHTML = header;

    var input = document.createElement("input");
    $(input).attr({
        'type': type,
        'class': 'form-control',
        'id': 'input' + this.id,
        'placeholder': placeholder
    });
    this.form.appendChild(div);
        div.appendChild(label);
        div.appendChild(input);
    return div;
};

BForm.prototype.addUpload = function (header, placeholder) {
    var div = this.addInput(header, placeholder, "file");
    var p = document.createElement("p");
    p.className = "help-block";
    p.innerHTML = placeholder;
    div.appendChild(p);
    return div;
}

BForm.prototype.toHTML = function () {
    var button = document.createElement("button");
    $(button).attr({
        'type': 'submit',
        'className': 'btn btn-default'
    });
    button.innerHTML = this.submitText;
    this.form.appendChild(button);
    console.log(this.form);
    return this.form;
};

var BPanel = function () {
    this.panel = document.createElement("div");
    this.panel.className = 'panel panel-default';
    this.panel.id = 'main-panel';

    this.body = document.createElement("div");
    this.body.className = 'panel-body';
};

BPanel.prototype.setContext = function (context) {
    this.panel.className = 'panel ' + context;
};

BPanel.prototype.setHeader = function (h_text) {
    this.header = document.createElement("div");
    this.header.className = "panel-heading";
    this.header.innerHTML = h_text;
    this.header.id = 'headertext';
};

BPanel.prototype.setCaption = function (c_text) {
    var text = document.createElement("p");
    text.innerHTML = c_text;
    text.id = 'captiontext';
    this.body.appendChild(text);
};

BPanel.prototype.setFooter = function (f_text, align) {
    this.footer = document.createElement("div");
    this.footer.className = "panel-footer";
    this.footer.innerHTML = f_text;
    this.footer.id = 'footertext';
};

BPanel.prototype.toHTML = function () {
    if (this.header) {
        this.panel.appendChild(this.header);
    }
    this.panel.appendChild(this.body);
    if (this.footer) {
        this.panel.appendChild(this.footer);
    }
    return this.panel;
};

var UploadForm = function (h_text, p_text, b_text) {
    var panel = new BPanel();
    panel.setHeader("Upload files");
    panel.setContext("panel-success");
    panel.setFooter("... or drag files anywhere into the upload box.");
    this.panel = panel.toHTML();
    panel_body = this.panel.getElementsByClassName('panel-body')[0];

    var button = document.createElement("button");
    button.id = 'upload-btn';
    button.className = 'btn btn-primary btn-large';
    button.innerHTML = b_text;

    var progress = document.createElement("div");
    progress.className = 'progress progress-wrap';
    progress.id = 'progress-container';
    $(progress).attr({
        'style': 'margin: 10px 0px 10px 0px; height: 1%;'
    });

    var bar = document.createElement("div");
    $(bar).attr({
        'class': 'progress-bar progress-bar-striped',
        'role': 'progressbar',
        'aria-valuenow': '0',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'style': 'width: 0%;' 
    });
    bar.id = 'progress-bar';

    var percent = document.createElement("span");
    percent.className = 'sr-only';
    //percent.text = '0% Complete';
    percent.id = 'progress-percent';

    panel_body.appendChild(button);
    panel_body.appendChild(progress);
        progress.appendChild(bar);
            bar.appendChild(percent);
};

UploadForm.prototype.toHTML = function () {
    return this.panel;
};