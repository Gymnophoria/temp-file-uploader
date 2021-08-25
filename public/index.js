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

var fileCount = 0;
var files = [];
var fileList = document.getElementById('files');

function handleNewFile(file) {
    var id = fileCount++;
    files.push(file);

    var li = document.createElement('li');
    li.setAttribute('id', 'file' + id);
    li.innerHTML = '<b>' + file.name + '</b> [<a href="#" onclick="removeFile('
        + id + ')">remove</a>]';

    fileList.appendChild(li);
}

function removeFile(id) {
    files.splice(id, 1);
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

var ONE_MINUTE = 60 * 1000;
var ONE_HOUR = 60 * ONE_MINUTE;
var ONE_DAY = 24 * ONE_HOUR;
var ONE_WEEK = 7 * ONE_DAY;
var MAX_TIME = 2 * ONE_WEEK;

var MAX_FILESIZE = 2000000000; // 2 GB

form.onsubmit = function(event) {
    event.preventDefault();

    if (checkFiles() && checkTime() && checkFileSize()) {
        uploadFiles();
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

    return handleError(expiryError, expiryQuantity.value * multiplier > MAX_TIME);
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

function uploadFiles() {
    console.log('uploading files beep boop bop');
}