'use strict';

//var compression = require('compression');
var bodyParser = require('body-parser');
var cors = require('cors');
//var methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var redis   = require('redis');
var RedisStore = require('connect-redis')(session);
var client  = redis.createClient();
var config = require('./env');

module.exports = function(app) {
  app.enable('trust proxy');
  var options = {
    origin: true,
    credentials: true
  };
  app.use(cors(options));
  app.use(fileUpload());
  //app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  //app.use(methodOverride());
  app.use(cookieParser());
  app.use(session({
    secret: config.session.secrets,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port,
      pass: config.redis.password || '',
      client: client
    }),
    cookie: config.session.cookie
  }));
  app.use(passport.initialize());

  // view engine setup
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'jade');
};
