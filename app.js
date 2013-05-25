/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.cookieSession({secret: "secreet"}));
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

app.get("/", function (req, res) {
    res.redirect('/index.html');
});

app.get('/testsession', function(req, res){
  req.session.count = req.session.count || 0;
  var n = req.session.count++;
  res.send('viewed ' + n + ' times\n');
});

app.listen(process.env.PORT || 3000);
