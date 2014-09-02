(function(){

  'use strict';

  var express       = require('express');
  var path          = require('path');
  var logger        = require('morgan');
  var cookieParser  = require('cookie-parser');
  var bodyParser    = require('body-parser');
  var routes        = require('./routes/index.js');
  var app           = express();
  var accepted      = { 
    GET     : true, 
    OPTIONS : true
  };

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(cookieParser());


  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use('/api/v1', routes.api);
  app.use('/*', routes.web);

  app.use(function(req, res, next){
    var method = req.method.toUpperCase();
    if (!accepted[method]){
      var err = new Error('Not an accepted method');
      err.status = 405;
      next(err);
    }
  });
  /// error handlers courtesy of express generator

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development'){
    // development error handler
    // will print stacktrace
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  if (app.get('env') === 'production'){
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    });
  }

  module.exports = app;

}());

