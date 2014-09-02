(function(){

  'use strict';

  var APISync         = {};
  var DatabaseService = require('../services/DatabaseService');
  var debug           = require('debug')('dbService');
  var request         = require('request');
  var db              = new DatabaseService(debug);
  var checksumPath    = require('./config').checksumPath;

  APISync.run = function(path, cb){ 
    db.connect(path)
      .then(function(port){ 
        success(port, cb); 
      })
      .fail(function(err){
        errorHandler(err, cb)
      })
  };

  APISync.fetchRemoteApi = function(){
    request.get('http://data.sfgov.org/resource/rqzj-sfat.json', function(err, res, body){
      if(err) return console.error(err);

      var queryFields   = { query: {}, doc: {} };    
      queryFields.query.objectid = 'objectid';
      queryFields.doc.location = [ 'longitude', 'latitude' ];
      queryFields.doc.times = [];

      db.requiresSync(body, 'Truck', queryFields, db.sync, checksumPath)
      .then(function(res){
        debug('write errors: %s', !+res ? 0 : res);
        process.exit(0);
      })
      .fail(function(err){
        throw new Error(err);
        process.exit(1);
      });
    });
  };

  var errorHandler = function(err, cb){
    if (err) debug(new Error(err));
    cb(false);
  };

  var success = function(port, cb){
    debug('connected to database on port: %s', port);
    cb(true);
  };

  module.exports = APISync;
}());
