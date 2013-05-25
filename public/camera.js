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
        ctx.drawImage(video, 0, 0);
        // "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
        document.querySelector('img').src = canvas.toDataURL('image/webp');
    }
}

video.addEventListener('click', snapshot, false);