var MunchiesMap = function(mapElement, options){

  this.renderedTrucks = { lastRequestCoords : null };
  this.googleMap      = new google.maps.Map(mapElement, options);

};

MunchiesMap.prototype.calculateDist = function(){

  // http://stackoverflow.com/questions/3525670/radius-of-viewable-region-in-google-maps-v3
  var bounds = this.googleMap.getBounds();
  var center = bounds.getCenter();
  var ne     = bounds.getNorthEast();
  // r = radius of the earth in statute miles
  var r      = 3963.0;
  // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
  var lat1   = center.lat() / 57.2958;
  var lon1   = center.lng() / 57.2958;
  var lat2   = ne.lat() / 57.2958;
  var lon2   = ne.lng() / 57.2958;

  // distance = circle radius from center to Northeast corner of bounds
  var dis    = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));

  return dis / 1.5; // tweak for UX
};
