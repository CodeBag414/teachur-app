// modules =================================================
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mandrill = require('mandrill-api/mandrill');
var favicon = require('serve-favicon');
var json2xls = require('json2xls');
var fs = require('fs');
var Handlebars = require('handlebars');
var organizationsMiddleware = require('./app/lib/organizationsMiddleware');

app.use(favicon(__dirname + '/public/landingPage/images/favicon.ico'));

// configuration ===========================================
var config = ('./config/config');
var dbConfig = require('./config/db');

// connect to our mongoDB database
mongoose.connect(process.env.MONGOLAB_URI || dbConfig.url);

// set our port
var port = process.env.PORT || 8080;

// set app secret
app.set('superSecret', config.secret);

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(cookieParser());
app.use(session({secret: 'ilovescotchyscotch', resave: false, saveUninitialized: true}));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

app.use(json2xls.middleware);

require('./config/passport')(passport);

//MANDRILL INIT

var mandrillClient = new mandrill.Mandrill('3NC40x27RO044m2uHeyK9Q');

app.use(function (req, res, next) {
  req.mandrillClient = mandrillClient;
  next();
});

// GLOBAL ERROR HANDLER
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

process.on('uncaughtException', function(err) {
  console.error(err.stack || err);
});

// routes ==================================================
var router = require('./app/routes'); // configure our routes

app.use(organizationsMiddleware);

// removes leading www from all requests
app.get('/*', function (req, res, next) {
  if (req.headers.host.match(/^www\./) != null) {
    res.redirect("http://" + req.headers.host.slice(4) + req.url, 301);
  } else {
    next();
  }
});

app.use('/api', router);

// frontend routes =========================================================
// route to handle all angular requests
app.get('/', function (req, res) {
  res.sendfile('./public/landingPage/index.html'); // load our public/index.html file
});

app.get('/app', function (req, res) {
  var organization = req.params.slug;
  var source = fs.readFileSync('./public/views/index.html', 'utf8');;
  var template = Handlebars.compile(source);
  var context = { baseUrl: process.env.URL || 'http://localhost:' + port };
  var html = template(context);
  res.send(html); // load our public/index.html file
});

app.get('/org/:slug', function (req, res) {
  var organization = req.params.slug;
  var source = fs.readFileSync('./public/build/index.html', 'utf8');;
  var template = Handlebars.compile(source);
  var context = { baseUrl: process.env.URL || 'http://localhost:' + port, organization: organization };
  var html = template(context);
  res.send(html); // load our public/index.html file
});

app.get('/please-upgrade-your-browser', function (req, res) {
  res.sendfile('./public/upgradeBrowser/index.html'); // load our public/index.html file
});

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user                     
console.log('Magic happens on port ' + port);

// expose app           
module.exports = app; 