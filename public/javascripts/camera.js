var video, canvas, ctx;
$(document).ready(function() {
    video = document.querySelector('video');
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    if (!navigator.getUserMedia) {
        fallback();
    } else {
        navigator.getUserMedia({video: true}, success, fallback);
    }
    video.addEventListener('click', snapshot, false);
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
    $("#camera").show();
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
        ctx.drawImage(video, -80, 0);
        // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
        var img = document.querySelector('img');
        img.src = canvas.toDataURL('image/webp');
        img.style.position = "absolute";
        img.style.width = video.offsetWidth + "px";
        img.style.height = video.offsetHeight + "px";
        img.style.left = video.offsetLeft + "px";
        img.style.top = video.offsetTop + "px";
        $(img).show();
    }
    /*document.getElementById("take").onclick = retake;*/
    $("#snapshot-button").hide();
    $("#use-button").show();
}

function usePhoto() {
    var img = document.querySelector('img');
    ServerBackend.sendPhoto(img.src);
    $("#camera").hide();
    $(img).hide();
    $("#snapshot-button").show();
    $("#use-button").hide();
}

function retake() {
    document.getElementById("pic").style.display = "none";
    document.getElementById("take").onclick = snapshot;
    document.getElementById('take').innerHTML = "Take a Picture";
}

