(function(){

  'use strict';

  /* Database Service Helpers */
  module.exports = function(mongoose, lodash, debug){
    var _ = lodash;

    var gracefulExit = function(){
      mongoose.connection.close(function(){
        debug('mongoose connection disconnected through app termination');
        process.exit(0);
      });
    };

    var mapFieldsAndQuery = function(bulk, collection, queryFields){
      // queryFields { query: { objectid : 'objectid' }, doc: {location: [lng,lat]}}
      // parses through all fields to form a query object and map values onto doc

      _.forEach(collection, function(doc){
        var query = {};
        
        if (queryFields.query) {
          _.forEach(Object.keys(queryFields.query),function(field){
            query[field] = doc[field].toString();
          });
        }

        if (queryFields.doc) {
          _.forEach(Object.keys(queryFields.doc),function(field){
            if (Array.isArray(queryFields.doc[field])){
              doc[field] = [];
              _.forEach(queryFields.doc[field], function(arrayField){
                doc[field].push(parseFloat(doc[arrayField]));
              })
            } else {
              doc[field] = queryFields.doc[field];
            }
          }); 
        }

        bulk.find(query).upsert().updateOne(doc);
      });
    }

    return {
      gracefulExit     : gracefulExit,
      mapFieldsAndQuery: mapFieldsAndQuery
    }
  }
}());