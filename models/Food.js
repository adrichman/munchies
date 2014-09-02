(function(){
  
'use strict';

  var FoodFactory = function(mongoose){
    var foodSchema = new mongoose.Schema({
      _id : Number,
      type: String,
      trucks: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' }]
    },{ 
      collection: 'foods' 
    });

    var Food = mongoose.model('Food', foodSchema);
    return Food;
  };

  module.exports = FoodFactory;

}());
