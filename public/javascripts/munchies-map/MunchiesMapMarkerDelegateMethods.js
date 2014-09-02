MunchiesMapMarkerDelegateMethods = {};
MunchiesMapMarkerDelegateMethods.compileInfoWindow = function(truck){
  if (!truck) return;
    
  var foodList = "";

  _(truck.fooditems.split(': ')).forEach(function(food){
    foodList += "<li>"+ food.trim() +"</li>"
  });
  
  var infoWindowTemplate = "" +
    "<div class=\"info-window\" data-truck-id=\"" + truck._id + "\">"+
      "<div>" +
          "<div style=\"font-weight: 700\">" + truck.applicant + "</div>" +
          "<ul>" +
              foodList +
          "</ul>" + 
      "</div>" +
    "</div>";

  return infoWindowTemplate;
};

MunchiesMapMarkerDelegateMethods.createInfoWindow = function(truck){
  if (!truck) return;

  var self        = this;
  var template    = this.compileInfoWindow(truck);
  var infoWindow  = new google.maps.InfoWindow({
      content : template
  });

  google.maps.event.addListener(infoWindow, 'closeclick', function(e){
    if (self.infoWindows.trucks[truck._id] && self.infoWindows.trucks[truck._id].isOpen) self.closeInfoWindow(truck._id);
  });
  self.infoWindows.trucks[truck._id] = infoWindow;
};

MunchiesMapMarkerDelegateMethods.closeInfoWindow = function(id){
  this.infoWindows.trucks[id].close();
  this.infoWindows.count--;
  this.infoWindows.trucks[id].isOpen = false;
  this.map.googleMap.panTo(this.lastCoords);
};

MunchiesMapMarkerDelegateMethods.createTruckMarker = function(truck){
  if (!truck) return;
 
  // place the initial marker
  var self = this;
  var coords = new google.maps.LatLng(truck.latitude, truck.longitude);
  var marker = new google.maps.Marker({
    position: coords,
    map: this.map.googleMap,
    animation: google.maps.Animation.DROP,
    title: truck.applicant
  });

  self.map.renderedTrucks[truck._id] = 1;

  google.maps.event.addListener(marker, 'click', function() {
    var openInfoWindows = _(document.getElementsByClassName('info-window'));
    self.lastCoords     = self.map.googleMap.getCenter();

    self.infoWindows.trucks[truck._id].open(self.map.googleMap,marker)
    self.infoWindows.trucks[truck._id].isOpen = true;
    self.infoWindows.count++;

    openInfoWindows.forEach(function(win){
      if (win.getAttribute('data-truck-id') === truck._id){
        win.addEventListener('click', function(e){
          if (self.infoWindows.trucks[truck._id] && self.infoWindows.trucks[truck._id].isOpen){
            self.closeInfoWindow(truck._id);
          }
        })
      }
    })

    setTimeout(function(){
      if (self.infoWindows.trucks[truck._id].isOpen){
        self.closeInfoWindow(truck._id);
      }
    },3500)

  });

  self.createInfoWindow(truck);
};
