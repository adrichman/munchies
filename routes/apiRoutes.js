(function(){

  'use strict';

  var router  = require('express').Router();
  var helpers = require('./helpers.js');

  router.get('/trucks',        helpers.get.bind(null,'Truck'));
  router.get('/trucks/:truck', helpers.get.bind(null,'Truck'));
  router.get('/foods',         helpers.get.bind(null,'Food'));
  router.get('/foods/food',    helpers.get.bind(null,'Food'));

  module.exports = router;

}());
