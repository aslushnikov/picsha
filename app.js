/**
 * Module dependencies.
 */
var express = require('express')
  , MongoStore = require('connect-mongo')(express);

var app = module.exports = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , uuid = require('uuid')
  , cookie = require('cookie')
  , connect = require('connect');

var SITE_SECRET = "I have no idea what I'm doing";
var DB_NAME = "picsha"

var sessionStore = new MongoStore({db: DB_NAME});
// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: SITE_SECRET, key: 'express.sid', store: sessionStore}));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Socket.IO
var activeSockets = {};

io.set('transports', [
            'websocket'
          , 'htmlfile'
          , 'xhr-polling'
          , 'jsonp-polling'
        ]);

io.set('authorization', function(data, accept) {
    if (data.headers.cookie) {
        var sessionCookie = cookie.parse(data.headers.cookie);
        var sessionID = connect.utils.parseSignedCookie(sessionCookie['express.sid'], SITE_SECRET);
        sessionStore.get(sessionID, function(err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                data.session = session;
                data.sessionID = sessionID;
                accept(null, true);
            }
        });
    } else {
        accept('No cookie', false);
    }
});

io.sockets.on('connection', function (socket) {
    var sessionID = socket.handshake.sessionID;
    socket.on('photo', function(data) {
        onPhotoReceived(sessionID, data);
    });
    socket.on('like', function(photoId) {
        onPhotoLike(sessionID, photoId);
    });
    socket.on('disconnect', function() {
        delete activeSockets[sessionID];
    });
    activeSockets[sessionID] = socket;
});

// Routing
app.get("/", function (req, res) {
    res.redirect('/underconstruction.html');
});

app.get("/clients", function (req, res) {
    res.send('Active clients: ' + activeSockets.length);
});

app.get("/photos", function (req, res) {
    Photo.find({$or: [{sender: req.sessionID}, {receiver: req.sessionID}]}, function(err, photos) {
        if (err) throw err;
        var sentPhotos = []
          , receivedPhotos = [];
        for(var i = 0; i < photos.length; ++i) {
            var photo = photos[i];
            if (photo.sender === req.sessionID)
                sentPhotos.push(serverToClientPhoto(photo))
            else
                receivedPhotos.push(serverToClientPhoto(photo));
        }
        res.json({received: receivedPhotos, sent: sentPhotos});
    });
});

app.get('/session', function(req, res){
    req.session.count = req.session.count || 0;
    var n = req.session.count++;
    res.send('viewed ' + n + ' times\n');
});

app.get('/waiting', function(req, res) {
    getOrCreateUser(req.sessionId, function(err, user) {
        if (err) throw err;
        res.json(user.waitingFor);
    });
});

// Mongo DB
var mongoose = require('mongoose')
var photoSchema = mongoose.Schema({
        id: String,
        src: String,
        sender: String,
        receiver: String,
        longitude: Number,
        latitude: Number,
        date: Date,
        liked: Boolean
    })
  , Photo = mongoose.model('photos', photoSchema);
var userSchema = mongoose.Schema({
        id: String,
        waitingFor: Number
    })
  , User = mongoose.model('users', userSchema);

// Mapping between sessionID and userID
function socketForUserId(userId) {
    return activeSockets[userId];
}

// Mapping between server.photo and client.photo
function serverToClientPhoto(photo) {
    return {
        id: photo.id,
        src: photo.src,
        longitude: photo.longitude,
        latitude: photo.latitude,
        date: photo.date,
        liked: photo.liked
    };
}

mongoose.connect('mongodb://localhost/' + DB_NAME);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("success connect to mongodb");
    server.listen(process.env.PORT || 3000);
});

// Model
function getOrCreateUser(id, callback) {
    User.findOne({ id: id}, function(err, user) {
        if (err || !user) {
            user = new User({id: id, waitingFor: 0});
            return user.save(callback);
        }
        callback(null, user);
    });
}

// Routing logic

function logerr(err) { if (err) console.error(err); }

function onPhotoReceived(userId, photo) {
    getOrCreateUser(userId, function(err, user) {
        user.waitingFor += 1;
        user.save(findPhotoForUser);
    });
    var photo = new Photo({
        id: photo.id,
        src: photo.base64,
        sender: userId,
        longitude: photo.longitude,
        latitude: photo.latitude,
        date: new Date(),
        liked: false
    });
    photo.save(findUserForPhoto);
}

function onPhotoLike(userId, photoId) {
    Photo.findOne({id: photoId}, function(err, photo) {
        if (err) return console.error(err);
        if (!photo) return;
        photo.liked = true;
        photo.save(logerr);
        var socket = socketForUserId(photo.sender);
        if (socket) {
            socket.emit("like", photo.id);
        }
    });
}

function assocUserWithPhoto(user, photo) {
    if (!user || !photo) return;
    photo.receiver = user.id;
    user.waitingFor -= 1;
    photo.save(logerr);
    user.save(logerr);
    var socket = socketForUserId(user.id);
    if (socket) {
        socket.emit("photo", serverToClientPhoto(photo));
    }
}

function findPhotoForUser(err, user) {
    if (err) return console.error(err);
    if (!user) return;
    Photo.findOne({sender: {$ne: user.id}, receiver: {$exists: false}}, function(err, photo) {
        if (err) return console.error(err);
        assocUserWithPhoto(user, photo);
    });
}

function  findUserForPhoto(err, photo) {
    if (err) return console.error(err);
    if (!photo) return;
    User.findOne({id: {$ne: photo.sender}, waitingFor: {$gt: 0}}, function(err, user) {
        if (err) return console.error(err);
        assocUserWithPhoto(user, photo);
    });
}
