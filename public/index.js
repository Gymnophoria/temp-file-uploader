// ----------------------------
//  uploader div functionality
// ----------------------------
var uploader = document.getElementById('uploader');

uploader.addEventListener('drop', dropHandler);
uploader.addEventListener('dragover', dragOverHandler);
uploader.addEventListener('dragleave', removeDragStyle);
uploader.addEventListener('click', selectFiles);

document.body.onfocus = removeDragStyle; // remove style when choose file dialog closed

// on hover functionality while files dragged over
function addDragStyle() {
    uploader.style.borderColor = '#ad3bff';
    uploader.style.backgroundColor = '#f8edff'
}

function removeDragStyle() {
    uploader.style.borderColor = 'black';
    uploader.style.backgroundColor = 'transparent';
}

// ---------------------------
//  hidden input for uploader
// ---------------------------

// import function stolen from https://codepen.io/udaymanvar/pen/MWaePBY

var input = document.createElement('input');
input.type = 'file';
input.multiple = 'multiple';
input.form = 'form';

input.onchange = function () {
    // removeDragStyle();
    var files = Array.from(input.files);
    for (var i = 0; i < files.length; i++) {
        handleNewFile(files[i]);
    }
}

function selectFiles() {
    addDragStyle();
    input.click();
}

// ----------------------------
//  uploader div drag and drop
// ----------------------------

// drag and drop functionality built upon MDN example:
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop

function dropHandler(event) {
    removeDragStyle();

    event.preventDefault();

    if (event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s) if available
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
            if (event.dataTransfer.items[i].kind === 'file') {
                handleNewFile(event.dataTransfer.items[i].getAsFile());
            }
        }
    } else {
        // Use DataTransfer interface to access the file(s) otherwise
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
            handleNewFile(event.dataTransfer.files[i]);
        }
    }
}

function dragOverHandler(event) {
    addDragStyle();

    // prevent default event, file being opened
    event.preventDefault();
}

// ---------------
//  file handling
// ---------------

var SI_PREFIXES = [ '', 'K', 'M', 'G' ];

function humanizeFilesize(size) {
    for (var i = 0; i < SI_PREFIXES.length; i++) {
        if (size < 1000) return size.toFixed(i < 2 ? 0 : 1) + ' ' + SI_PREFIXES[i] + 'B';
        size /= 1000;
    }
}

var fileCount = 0;
var files = [];
var fileList = document.getElementById('files');

function handleNewFile(file) {
    file.id = fileCount++;
    files.push(file);

    var li = document.createElement('li');
    li.setAttribute('id', 'file' + file.id);
    li.innerHTML = '<b>' + file.name + '</b> (' + humanizeFilesize(file.size)
        + ') [<a href="#" onclick="removeFile(' + file.id + ')">remove</a>]';

    fileList.appendChild(li);
}

function removeFile(id) {
    files.splice(id, 1); // TODO: fix this bad code, lol (remove by index of fileID, don't assume ID is correct index)
    document.getElementById('file' + id).remove();
}

// https://www.w3schools.com/xml/ajax_xmlhttprequest_send.asp

// -------------------
//  upload validation
// -------------------

var form = document.getElementById('form');
var expiryQuantity = document.getElementById('expiry-quantity');
var expiryUnits = document.getElementById('expiry-units');
var expiryError = document.getElementById('expiry-error');
var fileSizeError = document.getElementById('filesize-error');
var noFilesError = document.getElementById('nofiles-error');
var expiryInMilliseconds;

var ONE_MINUTE = 60 * 1000;
var ONE_HOUR = 60 * ONE_MINUTE;
var ONE_DAY = 24 * ONE_HOUR;
var ONE_WEEK = 7 * ONE_DAY;
var MAX_TIME = 2 * ONE_WEEK;

var MAX_FILESIZE = 2000000000; // 2 GB

form.onsubmit = function(event) {
    event.preventDefault();

    if (checkFiles() && checkTime() && checkFileSize()) {
        validateAccess();
    }

    return false;
}

function checkTime() {
    var multiplier;

    switch (expiryUnits.value) {
        case 'm':
            multiplier = ONE_MINUTE;
            break;
        case 'h':
            multiplier = ONE_HOUR;
            break;
        case 'd':
            multiplier = ONE_DAY;
            break;
        case 'w':
            multiplier = ONE_WEEK;
            break;
        default:
            return false;
    }

    expiryInMilliseconds = expiryQuantity.value * multiplier;

    return handleError(expiryError, expiryInMilliseconds > MAX_TIME);
}

function checkFileSize() {
    var totalSize = 0;

    for (var i = 0; i < files.length; i++) {
        totalSize += files[i].size;
    }

    return handleError(fileSizeError, totalSize > MAX_FILESIZE);
}

function checkFiles() {
    return handleError(noFilesError, files.length <= 0);
}

function handleError(element, hasError) {
    if (hasError) {
        element.removeAttribute('hidden');
        return false;
    }

    if (!element.hasAttribute('hidden'))
        element.setAttributeNode(document.createAttribute('hidden'));
    return true;
}

// ----------------
//  file uploading
// ----------------

var passwordInput = document.getElementById('password');
var uploadButton = document.getElementById('upload-button');
var filesInProgress = {};

function itemizeFiles() {
    var out = [];

    for (var i = 0; i < files.length; i++) {
        out.push({
            size: files[i].size,
            name: files[i].name,
            lastModified: files[i].lastModified
        });
    }

    return out;
}

function disableSubmit() {
    uploadButton.setAttributeNode(document.createAttribute('disabled'));
}

function enableSubmit() {
    uploadButton.removeAttribute('disabled');
}

function validateAccess() { // TODO: show "validating" text until uploadFiles() is reached
    var upload = {
        expiry: expiryInMilliseconds,
        password: passwordInput.value,
        files: itemizeFiles()
    }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            uploadFiles(this.response);
        } else if (this.readyState == 4) {
            console.log('Error validating! Status code: ' + this.status);
            console.log(this.responseText);
            // TODO: show user error
        }
    }

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.open('POST', '/validate', true);

    xhr.send(JSON.stringify(upload));
}

function uploadFiles(response) { // response contains an array of keys to upload with
    for (var i = 0; i < files.length; i++) {
        // TODO: show "Uploading... " for % progress to show afterwards

        var file = files[i];
        var key = response[i];
        filesInProgress[file.id] = file;

        var xhr = new XMLHttpRequest();

        xhr.onprogress = function(event) {
            // TODO: show progress with event.loaded percentage on each file
        }

        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                onFinish(file, key);
            } else if (this.readyState == 4) {
                console.log('Error when uploading files with status ' + this.status);
                console.log(this.responseText);
            }
        }

        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.open('POST', '/upload/' + key, true);

        var formData = new FormData();
        formData.append(file.name, file);

        xhr.send(formData)
    }

    files = [];
}

function onFinish(file, key) {
    // replace "Uploading..." text with URL to download
    // remove file from filesInProgress
}