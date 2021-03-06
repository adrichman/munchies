(function(){

  'use strict';

  var mongoose        = require('mongoose');
  var MD5             = require('MD5');
  var q               = require('q');
  var _               = require('lodash');
  var fs              = require('fs');
  var request         = require('request');
  var Models          = require('../../models')();
  var debug           = require('debug')('dbService');
  var helpers         = require('./helpers.js')(mongoose, _, debug);

  var DatabaseService = function(){
    this.db = {};
    this.models = Models;
    this.isConnected = false;
  };

  DatabaseService.prototype.retrieve = function(modelName, query, cb){
    var Model = Models.get(modelName);
    query = query || {};
    if (modelName && !query.objectid && !query.location) {
      Model.find(query, cb);
    } else if (query.location) {
      Model.find(query, cb);
    } else if (query.objectid) {
      Model.findOne().where(query).exec(cb);
    }
  };  

  DatabaseService.prototype.connect = function(path){
    var deferred = q.defer();
    var self = this;
    mongoose.connect(path);
    this.db = mongoose.connection;
    
    this.db.on('error', function(err){ 
      this.isConnected = false;
      deferred.reject(err); 
    });
    
    this.db.on('connected', function(){
      this.isConnected = true;
    })

    this.db.once('open',function(){
      deferred.resolve(self.db.port); 
    });

    this.db.on('disconnect', function(){
      this.isConnected = false;
    })
    process.on('SIGINT', helpers.gracefulExit).on('SIGTERM', helpers.gracefulExit);
    return deferred.promise;
  };

  DatabaseService.prototype.disconnect = function(){
    mongoose.disconnect();
    this.isConnected = false;
  };

  DatabaseService.prototype.requiresSync = function(body, modelName, queryFields, sync, path){
    /* requires: 
     * body of which to calculate checkum 
     * modelName, queryFields, and sync method to pass
     * path to simple text file where relevant checksum is stored
     */
    var syncRequired = true; 
    var oldChecksum  = "";
    var checksum     = MD5(body);
    var deferred     = q.defer();
    var self         = this;

    // read previous checksum and check for equality with new checksum
    fs.readFile(path, function(err, data){
      oldChecksum += data;
      oldChecksum = oldChecksum.split('\n')[0];

      if (err) {
        debug(new Error(err));
        deferred.reject(err);
        return;
      } 

      if (oldChecksum === checksum) {
        debug('sync not required');
        syncRequired = false;
        deferred.resolve(syncRequired);
        return;
      }

      sync(body, modelName, queryFields, checksum)
      .then(function(bulkWriteResult){ 
              debug('successful sync upserted: %s documents', bulkWriteResult.nUpserted);
              checksum && self.updateChecksum(checksum, path).then(function(){
                deferred.resolve(bulkWriteResult.getWriteErrors.length); 
              });
      })
      .fail(function(err){
              debug(new Error(err));
              deferred.reject(false);
      });
    });

    return deferred.promise;
  };

  DatabaseService.prototype.updateChecksum = function(checksum, path){
    var deferred = q.defer();
    fs.writeFile(path, checksum, function(err){
      if (err) {
        deferred.reject(err)
      } else {
        deferred.resolve(debug('recorded new checksum'));
      }
    })
    return deferred.promise;
  };

  DatabaseService.prototype.sync = function(body, modelName, queryFields, checksum){
    var collection = JSON.parse(body);
    var bulk       = mongoose.model(modelName).collection.initializeUnorderedBulkOp() 
    var deferred = q.defer();
    
    helpers.mapFieldsAndQuery(bulk, collection, queryFields);

    bulk.execute(function(err, bulkWriteResult){
      if (err || !bulkWriteResult) { 
        deferred.reject(err); 
      } else { 
        deferred.resolve(bulkWriteResult);
      }
    });
    
    return deferred.promise;
  };

  module.exports = DatabaseService;
}());
