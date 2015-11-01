function walkDOM (node) {
    var node_list = [];
    node_list.push(node)

    node = node.firstChild;
    while(node) {
        node_list.concat(walkDOM(node,func));
        node = node.nextSibling;
    }

    return node_list;
};
