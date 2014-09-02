(function(){

  'use strict';

  var TruckFactory = function(mongoose){
    var truckSchema = new mongoose.Schema({
      times: Array,
      location: [],
      status: String,
      expirationdate: Date,
      permit: String,
      block: String,
      facilitytype: String,
      blocklot: String,
      locationdescription: String,
      cnn: Number,
      priorpermit: Number,
      approved: Date,
      schedule: String,
      address: String,
      applicant: String,
      lot: String,
      fooditems: String,
      longitude: Number,
      latitude: Number,
      objectid: String,
      y: Number,
      x: Number
    },{ 
      collection: 'trucks' 
    });

    truckSchema.index({ location: '2d' });
    
    var Truck = mongoose.model('Truck', truckSchema);
    return Truck;
  };

  module.exports = TruckFactory;

}());
