function getRunning() {
    return $.ajax({
        type: 'GET',
        url: webapp + "/review/running",
        cache: 'false',
        dataType: 'json'
    });
};

function getHistory() {
    return $.ajax({
        type: 'GET',
        url: webapp + "/review/history",
        cache: 'false',
        dataType: 'json'
    });
};

function postReview(id, state, comment) {
    return $.ajax({
        type: 'POST',
        url: webapp + '/review/' + id,
        cache: 'false',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({review: [id, state, comment]})
    });
};
