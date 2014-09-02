(function(){

  'use strict';

  var router  = require('express').Router();
  var helpers = require('./helpers.js');

  router.get('/trucks',        helpers.get.bind(null,'Truck'));
  router.get('/trucks/:truck', helpers.get.bind(null,'Truck'));

  router.get('/*', function(req, res, next){ next() });

  module.exports = router;

}());
