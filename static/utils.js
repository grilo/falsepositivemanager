function jsRender(tpl, data) {
    var div = document.createElement("div");
    div.innerHTML = tpl.render(data);
    return div.firstChild;
}
