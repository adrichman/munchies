(function(){
  
  'use strict';

  var express   = require('express');
  var router    = express.Router();
  var api       = require('./apiRoutes');
  var Router    = {};

  /* GET home page. */
  Router.web = router;
  Router.api = router;

  Router.api.get('*', api);

  Router.web.get('/', function(req, res) {
    res.render('index', { title: 'Munchies!' });
  });

  Router.web.get('*', function(req, res) {
    res.redirect('/');
  });

  module.exports = Router;
}());
