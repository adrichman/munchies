var Truck = require('./Truck.js');
var Food  = require('./Food.js');

var Models = function(mongoose){
  var models = {};
  models.Truck  = Truck(mongoose);
  models.Food   = Food(mongoose);
  
  return {
    get: function(modelName){
      return models[modelName] 
    }
  }
}

module.exports = Models;