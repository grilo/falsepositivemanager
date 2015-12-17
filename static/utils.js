function jsRender(tpl, data) {
    var div = document.createElement("div");
    div.innerHTML = tpl.render(data);
    return div.firstChild;
}

// Convert the epoch date into something human readable
function dateEpochToHuman(pythonDate) {
    var d = new Date(Math.floor(pythonDate * 1000));
    var datestring = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + d.getSeconds();         return datestring;
}
