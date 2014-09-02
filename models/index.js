(function(){

  'use strict';

  var Truck = require('./Truck.js');
  var Food  = require('./Food.js');

  var Models = function(){
    var models = {};
    models.Truck  = Truck;
    models.Food   = Food;
    
    return {
      get: function(modelName){
        return models[modelName] 
      }
    }
  }

  module.exports = Models;
}());
