(function(config){

  'use strict';

  config = config || {};
  
  config.dbPath = process.env.MONGOHQ_URL || process.env.MUNCHR_DB;
  
  module.exports = config;

}());