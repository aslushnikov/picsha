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
var activeSockets = [];

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
    socket.on('photo', function(data) {
        onPhotoReceived(socket.handshake.sessionID, data);
    });
    socket.on('disconnect', function() {
        var index = activeSockets.indexOf(socket);
        if (index >= 0) activeSockets.splice(index, 1);
    });
    activeSockets.push(socket);
});

// Routing
app.get("/", function (req, res) {
    res.redirect('/underconstruction.html');
});

app.get("/clients", function (req, res) {
    res.send('Active clients: ' + activeSockets.length);
});

app.get('/session', function(req, res){
    req.session.count = req.session.count || 0;
    var n = req.session.count++;
    res.send('viewed ' + n + ' times\n');
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

function waitingUsers(callback) {
    User.find({waitingFor: {"$gt": 0}}, callback);
}

// Routing logic

function logerr(callback, err, obj) {
    if (err) console.log(err);
    if (obj && typeof callback === 'function') callback(obj);
}

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

function assocUserWithPhoto(user, photo) {
    if (!user || !photo) return;
    photo.receiver = user.id;
    user.waitingFor -= 1;
    photo.save();
    user.save();
}

function findPhotoForUser(err, user) {
    if (err) return console.error(err);
    if (!user) return;
    Photo.findOne({sender: {$ne: user.id}, received: {$exists: false}}, function(err, photo) {
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
