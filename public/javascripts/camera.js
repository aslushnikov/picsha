var video, canvas, ctx, cropCanvas = document.createElement("canvas"),
    mobileImageUpload = document.createElement("img");
$(document).ready(function () {
    video = document.querySelector('video');
    canvas = document.querySelector('canvas');
    turnon();
    $("#mobile-camera-fallback").on("change", mobileUpload);
});

function mobileUpload() {
    var oFReader = new FileReader(), rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
    if (document.getElementById("mobile-camera-fallback").files.length === 0) {
        return;
    }
    var oFile = document.getElementById("mobile-camera-fallback").files[0];
    if (!rFilter.test(oFile.type)) {
        alert("You must select a valid image file!"); return;
    }
    oFReader.onload = function (oFREvent) {
        var base64url = oFREvent.target.result;
        mobileImageUpload.onload = function() {
            cropImageSource(mobileImageUpload);
            usePhoto();
        }
        mobileImageUpload.src = base64url;
    }
    oFReader.readAsDataURL(oFile);
}

var localMediaStream = null;
window.URL = window.URL || window.webkitURL;
function turnon() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({audio: false, video: true}, function (stream) {
            video.src = window.URL.createObjectURL(stream);
            localMediaStream = stream;
        }, onFailSoHard);
    } else {
        video.src = 'somevideo.webm'; // fallback.
    }
}

function showCamera() {
    if (false && mobilecheck()) {
        $("#mobile-camera-fallback").trigger("click");
        return;
    }
    var $cam = $("#camera");
    var $overlay = $("#overlay");
    $overlay.fadeIn("fast");
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;
    ctx = canvas.getContext('2d');
    $(canvas).hide();
    $("#snapshot-button").show();
    $("#use-button").hide();
    $("#cancel-button").hide();
    var shadow = $overlay.find(".shadow").get(0);
    $overlay.click(function(e) {
        if (e.target === shadow)
            $(this).fadeOut("fast");
    });
}

// Not showing vendor prefixes or code that works cross-browser:
function fallback(e) {
    video.src = 'fallbackvideo.webm';
}

function success(stream) {
    video.src = window.URL.createObjectURL(stream);
}

var onFailSoHard = function (e) {
    console.log('Reeeejected!', e);
};

function cropImageSource(target) {
    // crop image to make in rectangular
    var size = Math.min(target.width, target.height);
    cropCanvas.width = size;
    cropCanvas.height = size;
    var cropCtx = cropCanvas.getContext("2d");
    cropCtx.drawImage(target, (size - target.width) / 2, (size - target.height) / 2, target.width, target.height);
}

function snapshot() {
    if (localMediaStream) {
        var img = $("#camera img").get(0);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.src = canvas.toDataURL("image/png");
        canvas.style.position = "absolute";
        canvas.style.width = video.offsetWidth + "px";
        canvas.style.height = video.offsetHeight + "px";
        canvas.style.left = video.offsetLeft + "px";
        canvas.style.top = video.offsetTop + "px";
        $(canvas).show();
        cropImageSource(canvas);
    }
    $("#snapshot-button").hide();
    $("#use-button").show();
    $("#cancel-button").show();
}

function usePhoto() {
    // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
    var src = cropCanvas.toDataURL('image/png');
    ServerBackend.sendPhoto(src);
    $("#overlay").fadeOut("fast");
}

function cancelPhoto() {
    $(canvas).hide();
    $("#snapshot-button").show();
    $("#use-button").hide();
    $("#cancel-button").hide();
}

