(function(config){

  'use strict';

  config = config || {};
  
  config.dbPath = process.env.MONGOLAB_URI || process.env.MUNCHR_DB;
  
  module.exports = config;

}());