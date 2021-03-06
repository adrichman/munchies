(function(){

  'use strict';

  var DatabaseService = require('../services/DatabaseService');
  var config          = require('../config.js');
  var debug           = require('debug')('api');
  var db              = new DatabaseService(debug);

  function connectToDb(path, cb){
    // don't open a connection if a connection is active
    if (!db.db.isConnected){
      db.connect(path)
      .then(function(port){ 
        debug('connected to database on port: %s', port);
        cb()})
      .fail(function(err) { 
        if (err) debug(new Error(err));
        cb()});
    } else { 
      cb();
    }
  };

  function get(modelName, req, res, next){
    connectToDb(config.dbPath, function(){
      var query = {};
      var lng = req.query.lng;
      var lat = req.query.lat;
      var dist = req.query.dist / 39.59;
      if (req.params.truck !== undefined){
        query.objectid = req.params.truck.toString();
        db.retrieve(modelName, query, function(err, doc){
          res.json(doc)
        });
      } else {
        if (lng && lat && dist) {
          query.location = {} 
          query.location.$near = [ lng, lat ];
          query.location.$maxDistance = dist;
        };

        query.status = "APPROVED";
        db.retrieve(modelName, query, function(err, doc){
          res.json(doc)
        });
        return;
      };
    });
  };

  module.exports = {
    get : get,
    connectToDb: connectToDb
  }

}());
