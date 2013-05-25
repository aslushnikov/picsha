var video = document.querySelector('video');
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
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
    document.getElementById("take").onclick = snapshot;
    document.getElementById('take').innerHTML = "Take a Picture";
}

// Not showing vendor prefixes or code that works cross-browser:

function fallback(e) {
    video.src = 'fallbackvideo.webm';
}

function success(stream) {
    video.src = window.URL.createObjectURL(stream);
}

if (!navigator.getUserMedia) {
    fallback();
} else {
    navigator.getUserMedia({video: true}, success, fallback);
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
    }
    document.getElementById("pic").style.display = "block";
    document.getElementById("take").onclick = retake;
    document.getElementById('take').innerHTML = "Retake";
    document.getElementById("use").style.display = "inline";

}
function retake() {
    document.getElementById("pic").style.display = "none";
    document.getElementById("take").onclick = snapshot;
    document.getElementById('take').innerHTML = "Take a Picture";
}

video.addEventListener('click', snapshot, false);