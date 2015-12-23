var render = function (rootElement) {
    getTemplate("submit", function (tpl) {
        var tplData = {
            "title": "Upload files",
        };
        var node = jsRender(tpl, tplData);
        rootElement.empty();
        rootElement.append(node);

        var errBox = document.getElementById('footertext');
        var btn = document.getElementById("upload-btn");

        var uploader = new ss.SimpleUpload({
            button: 'upload-btn', // HTML element used as upload button
            dropzone: 'main-panel',
            url: '/owasp/projects', // URL of server-side upload handler
            name: 'uploadfile', // Parameter name of the uploaded file
            multipart: true,
            hoverClass: 'btn-hover',
            focusClass: 'active',
            disabledClass: 'disabled',
            responseType: 'json',

            onSubmit: function(filename, ext) {
                    this.setProgressBar(document.getElementById('progress-bar'));
                    this.setFileSizeBox(document.getElementById('progress-percent'));
            },
            onComplete: function(file, response, btn) {
                if (!response) {
                    errBox.innerHTML = 'Unable to upload file';
                } else {
                    errBox.innerHTML = 'Upload OK!';
                }
                if (response.success === true) {
                    errBox.innerHTML = 'Upload OK!';
                } else {
                    if (response.msg)  {
                        errBox.innerHTML = response.msg;
                    } else {
                        errBox.innerHTML = 'Unable to upload file';
                    }
                }
            }
        }); // End of SimpleUpload
    });
};
