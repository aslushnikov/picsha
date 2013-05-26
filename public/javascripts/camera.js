var video, canvas, ctx;
$(document).ready(function() {
    video = document.querySelector('video');
    canvas = document.querySelector('canvas');
    turnon();
});

var localMediaStream = null;
window.URL = window.URL || window.webkitURL;
function turnon() {
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: false, video: true}, function(stream) {
            video.src = window.URL.createObjectURL(stream);
            localMediaStream = stream;
        }, onFailSoHard);
    } else {
        video.src = 'somevideo.webm'; // fallback.
    }
}

function showCamera() {
    var $cam = $("#camera");
    var $overlay = $("#overlay");
    $overlay.fadeIn("fast");
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;
    ctx = canvas.getContext('2d');
    $(canvas).hide();
    $("#snapshot-button").show();
    $("#use-button").hide();
}

// Not showing vendor prefixes or code that works cross-browser:
function fallback(e) {
    video.src = 'fallbackvideo.webm';
}

function success(stream) {
    video.src = window.URL.createObjectURL(stream);
}

var onFailSoHard = function(e) {
    console.log('Reeeejected!', e);
};

function snapshot() {
    if (localMediaStream) {
        var img = $("#camera img").get(0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.src = canvas.toDataURL("image/webp");
        canvas.style.position = "absolute";
        canvas.style.width = video.offsetWidth + "px";
        canvas.style.height = video.offsetHeight + "px";
        canvas.style.left = video.offsetLeft + "px";
        canvas.style.top = video.offsetTop + "px";
        $(canvas).show();
    }
    $("#snapshot-button").hide();
    $("#use-button").show();
    $("#cancel-button").show();
}

function usePhoto() {
    // crop image to make in rectangular
    var cropCanvas = document.createElement("canvas");
    var size = Math.min(canvas.width, canvas.height);
    cropCanvas.width = size;
    cropCanvas.height = size;
    var ctx = cropCanvas.getContext("2d");
    ctx.drawImage(video, (size - canvas.width)/2, (size - canvas.height)/2, canvas.width, canvas.height);
    // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
    var src = cropCanvas.toDataURL('image/webp');
    ServerBackend.sendPhoto(src);
    $("#overlay").fadeOut("fast");
}

function cancelPhoto() {
    $(canvas).hide();
    $("#snapshot-button").show();
    $("#use-button").hide();
    $("#cancel-button").hide();
}

