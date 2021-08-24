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

var files = [];
var fileList = document.getElementById('files');

function handleNewFile(file) {
    var index = files.length;
    files.push(file);

    var li = document.createElement('li');
    li.setAttribute('id', 'file' + index);
    li.innerHTML = '<b>' + file.name + '</b> [<a href="#" onclick="removeFile('
        + index + ')">remove</a>]';

    fileList.appendChild(li);
}

function removeFile(index) {
    files.splice(index, 1);
    document.getElementById('file' + index).remove();
}

// https://www.w3schools.com/xml/ajax_xmlhttprequest_send.asp