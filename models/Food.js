(function(){
  
  'use strict';
  
  var mongoose = require('mongoose');

  var foodSchema = new mongoose.Schema({
    _id : Number,
    type: String,
    trucks: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' }]
  },{ 
    collection: 'foods' 
  });

  var Food = mongoose.model('Food', foodSchema);

  module.exports = Food;

}());
