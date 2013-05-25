// vim: softtabstop=2 shiftwidth=2
/**
 * Module dependencies.
 */
var express = require('express')

var app = module.exports = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server, { log: false })
  , uuid = require('uuid')
  , cookie = require('cookie')
  , connect = require('connect');

var SITE_SECRET = "I have no idea what I'm doing";

var sessionStore = new express.session.MemoryStore();
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
    socket.emit('news', { hello: 'world, hello!' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    socket.on('disconnect', function() {
        var index = activeSockets.indexOf(socket);
        if (index >= 0) activeSockets.splice(index, 1);
    });
    activeSockets.push(socket);
});


// Mongo DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  var kittySchema = mongoose.Schema({
      name: String
  });
  var Kitten = mongoose.model('Kitten', kittySchema);
});


// Routing
app.get("/", function (req, res) {
    res.redirect('/index.html');
});

app.get("/clients", function (req, res) {
    res.send('Active clients: ' + activeSockets.length);
});

app.get('/session', function(req, res){
    req.session.count = req.session.count || 0;
    var n = req.session.count++;
    res.send('viewed ' + n + ' times\n');
});

server.listen(process.env.PORT || 3000);
