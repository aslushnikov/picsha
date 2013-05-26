function Server() {
    this._socket = io.connect('/');
    this._socket.on("photo", this._photoReceived.bind(this));
    this._socket.on("like", this._photoLiked.bind(this));
    getCurrentPosition(function(position) {
       this._position = position;
    }.bind(this), 7000);
}

Server.prototype = {
    _photoReceived: function(photo)
    {
        console.log("Photo received");
        addPhoto(photo.id, photo.src, photo.latitude, photo.longitude, "top");
    },

    _photoLiked: function(photoId)
    {
        showPopup("Your photo has been liked!");
    },

    sendPhoto: function(base64)
    {
        var photo = {
            id: uuid.v1(),
            base64: base64
        };
        if (this._position) {
            photo.longitude = this._position.longitude;
            photo.latitude = this._position.latitude;
        }
        $.post('/addphoto', photo, "json")
            .done(function() { console.log("sent photo");})
            .fail(function() { console.log("sent failed");});
        //this._socket.emit("photo", photo);
        //console.log("send photo");
    },

    likePhoto: function(id)
    {
        this._socket.emit("like", id);
    }
}

var ServerBackend = new Server();

