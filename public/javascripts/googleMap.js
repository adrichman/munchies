var map;
var pendingUrls = [];
var mapPlaceholder = document.getElementById('mapPlaceholder');
// var lastCoords;
var center = { pinned : false, marker : null };
var initialize = function(){
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(showCurrentLocation);
  } else {
    alert("Geolocation API not supported.");
  }
};

var nearbyTruckStack = [];
var renderedTrucks   = {};
var infoWindows = { count : 0 };

var compileTemplate = function(truck){
  if (truck){
    var foodList = "";
    _.forEach(truck.fooditems.split(': '), function(food){
      foodList += "<li>"+ food +"</li>"
    });
  
    var template =  "<div class=\"info-window\" data-truck-id=\"" + truck._id + "\">"+
                        "<div>" +
                            "<div>" + truck.applicant + "</div>" +
                            "<ul>" +
                                foodList +
                            "</ul>" + 
                        "</div>" +
                    "</div>";
  } 
  return template;
};

var createInfoWindow = function(truck){
  var template = compileTemplate(truck);

  var infoWindow = new google.maps.InfoWindow({
      content : template
  });

  if (truck){
    google.maps.event.addListener(infoWindow, 'closeclick', function(e){
      if (infoWindows[truck._id] && infoWindows[truck._id].isOpen) closeInfoWindow(truck._id);
    });
  
    infoWindows[truck._id] = infoWindow;
  }
};

var closeInfoWindow = function(id){
  infoWindows[id].close();
  infoWindows.count--;
  infoWindows[id].isOpen = false;

  map.panTo(lastCoords);
  
  if (infoWindows.count === 0 && center.pinned === false) {
    document.getElementById('centerMarker').classList.remove('hide');
    document.getElementById('centerMarkerLabel').classList.remove('hide');
  }
};

var createTruckMarker = function(truck){
  // place the initial marker
  if (!truck) return;
  var coords = new google.maps.LatLng(truck.latitude, truck.longitude);
  var marker = new google.maps.Marker({
    position: coords,
    map: map,
    animation: google.maps.Animation.DROP,
    title: truck.applicant
  });

  renderedTrucks[truck._id] = 1;

  google.maps.event.addListener(marker, 'click', function() {
    lastCoords = map.getCenter();

    infoWindows[truck._id].open(map,marker)
    infoWindows[truck._id].isOpen = true;
    infoWindows.count++;

    var centerMarker = document.getElementById('centerMarker')
    var centerMarkerLabel = document.getElementById('centerMarkerLabel')
    centerMarker && centerMarker.classList.add('hide');
    centerMarkerLabel && centerMarkerLabel.classList.add('hide');

    var openInfoWindows = document.getElementsByClassName('info-window');

    _.forEach(openInfoWindows, function(win){
      if (win.getAttribute('data-truck-id') === truck._id){
        win.addEventListener('click', function(e){
          console.log(e);
          if (infoWindows[truck._id] && infoWindows[truck._id].isOpen) closeInfoWindow(truck._id);
        })
      }
    })

    setTimeout(function(){
      if (infoWindows[truck._id].isOpen){
        closeInfoWindow(truck._id);
      }
    },3500)
  });
  createInfoWindow(truck);
};

var addToTruckList = function(truckList, truck){
  if (!truckList || !truck) return;

  var truckRow = document.createElement('tr');
  truckRow.classList.add('truckRow');
  
  var truckName = document.createElement('td');
  truckName.classList.add('truckName');
  var name = truck.applicant.split('DBA ');
  truckName.innerText = name[name.length - 1];
  
  var truckAddress = document.createElement('td');
  truckAddress.classList.add('truckAddress');
  truckAddress.innerText = truck.address;
  
  truckRow.appendChild(truckName);
  truckRow.appendChild(truckAddress);
  truckList.appendChild(truckRow);
};

var displayNewTrucks = function(n){
  var truck;
  var truckList = document.getElementById('truckList');
  truckList.classList.add('list-unstyled');
  var nextDisplayed = nearbyTruckStack.splice(0,n);
  var i = 1;
  while (i <= n){
    setTimeout(function(){
      truck = nextDisplayed.pop();
      createTruckMarker(truck);
      truckList && addToTruckList(truckList, truck);
    }, i * 200);
    i++;
  }
}

var requestNearby = function(dist, n){
  var coords = map.getCenter();
  var jqxhr = function(){
    return $.get("api/v1/trucks/?lng="+ coords.B +"&lat="+ coords.k +"&dist=" + dist, function(data){
      _.forEach(data, function(truck){
        console.log(truck);
        nearbyTruckStack.push(truck);
      }) 
    });
  };
  jqxhr().done(function(){
    nearbyTruckStack.length && displayNewTrucks(n);  
  });
};

var addMapLoadListener = function(){
  // http://stackoverflow.com/questions/7341769/google-maps-v3-how-to-tell-when-an-imagemaptype-overlays-tiles-are-finished-lo

  var index = 0;   
  var urls = [ "http://placekitten.com/256/256", 
               "http://placekitten.com/g/256/256",
               "http://placekitten.com/255/255", 
               "http://placekitten.com/g/255/255",
               "http://placekitten.com/257/257", 
               "http://placekitten.com/g/257/257" ];

  var overlay = new google.maps.ImageMapType({
      getTileUrl: function() { 
          var url = urls[index % urls.length];
          index++;

          // Add this url to our list of pending urls
          pendingUrls.push(url);

          // if this is our first pending tile, signal that we just became busy
          if (pendingUrls.length === 1) {
               $(overlay).trigger("overlay-busy");   
          }

          return url; 
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: true,
      opacity: 0.00
  });

  // Listen for our custom events
  $(overlay).bind("overlay-idle", function(){});
  $(overlay).bind("overlay-busy", function(){});

  // Copy the original getTile function so we can override it, 
  // but still make use of the original function
  overlay.baseGetTile = overlay.getTile;

  // Override getTile so we may add event listeners to know when the images load
  overlay.getTile = function(tileCoord, zoom, ownerDocument) {

    // Get the DOM node generated by the out-of-the-box ImageMapType
    var node = overlay.baseGetTile(tileCoord, zoom, ownerDocument);

    // Listen for any images within the node to finish loading
    $("img", node).one("load", function() {

        // Remove the image from our list of pending urls
        var index = $.inArray(this.__src__, pendingUrls);
        pendingUrls.splice(index, 1);

        // If the pending url list is empty, emit an event to 
        // indicate that the tiles are finished loading
        if (pendingUrls.length === 0) {
          $(overlay).trigger("overlay-idle");
        }
    });

    return node;
  };

  map.overlayMapTypes.push(overlay);
  return $(overlay);
};

var staticMarkerVisibility = function(bool){
  var staticMarkers = document.getElementsByClassName('centerMarker');
  _.forEach(staticMarkers, function(marker){
      if (bool){
        marker.classList.remove('hide');
      } else {
        marker.classList.add('hide');
      }
  })
};


var recenter = function(){
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(showCurrentLocation);
  } else {
    alert("Geolocation API not supported.");
  }
};

var pinCenter = function(){
  var pinIcon = new google.maps.MarkerImage(
    "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00D900"
  );

  var coords = map.getCenter();
  var pinnedCenterMarker = new google.maps.Marker({
    position: coords,
    map: map,
    title: "Current Location",
    draggable: true,
    icon: pinIcon
  });
  center.pinned = true;
  center.marker = pinnedCenterMarker;
  center.infoWindow = false;

  var infoWindow = new google.maps.InfoWindow({
    content : "<div class=\"info-window\">You Are Here!</div>"
  });

  google.maps.event.addListener(pinnedCenterMarker, 'mouseup', function(){
    map.panTo(pinnedCenterMarker.getPosition());
  })
  
  google.maps.event.addListener(pinnedCenterMarker, 'click', function(){
    if (!center.infoWindow){
      infoWindow.open(map,pinnedCenterMarker);
    } else {
      infoWindow.close();
      infoWindow.content = "<div>I'm Different</div>";
    }
    center.infoWindow = !center.infoWindow;
  })

  staticMarkerVisibility(false);
};

var unpinCenter = function(){
  center.marker.setMap(null);
  center.pinned = false;
  center.marker = null;
  map.getCenter();
  staticMarkerVisibility(true);
}

var showCurrentLocation = function(position){
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var coords = new google.maps.LatLng(latitude, longitude);
  lastCoords = coords;

  if (map) {
    map.panTo(coords);
    return;
  }
  
  var mapOptions = {
    zoom: 16,
    center: coords,
    mapTypeControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    bounceDuration: 1400
  };

  //create the map, and place it in the HTML map div
  var mapElement = document.getElementById("mapPlaceholder");
  map = new google.maps.Map(
    mapElement, mapOptions
  );

  var renderCenterStaticMarker = function(){
    var centerMarker      = document.createElement('div');
    var centerMarkerLabel = document.createElement('div');
    centerMarker.id = "centerMarker";
    centerMarkerLabel.id = "centerMarkerLabel";
    centerMarkerLabel.innerText = "Current Location";
    centerMarker.classList.add('centerMarker');
    centerMarkerLabel.classList.add('centerMarker');
    centerMarkerLabel.classList.add('centerMarkerLabel');
    mapElement.appendChild(centerMarker);
    mapElement.appendChild(centerMarkerLabel);
  };

  var overlay = addMapLoadListener();
  
  overlay.on("overlay-idle", function(){
    if (document.getElementById('centerMarker') === null){
      // renderCenterStaticMarker();
      !center.pinned && pinCenter();
    }
  })

  //place the initial marker
  //- var marker = new google.maps.Marker({
  //-   position: coords,
  //-   map: map,
  //-   animation: google.maps.Animation.DROP,
  //-   title: "Current location!"
  //- });
  // var toggleBounce = function() {
  //   if (marker.getAnimation() != null) {
  //     marker.setAnimation(null);
  //   } else {
  //     marker.setAnimation(google.maps.Animation.BOUNCE);
  //   }
  // }

  // var drag = false;
  // google.maps.event.addListener(map, 'mouseup', function(e){ 
    // drag = !drag; 
//     console.log(map.getCenter());
  // });
//   google.maps.event.addListener(map, 'mousedown', function(e){ drag = !drag });
  google.maps.event.addListener(map, 'center_changed', function(e) {
    // lastCoords = map.getCenter();
    nearbyTruckStack = [];
  });
};

google.maps.event.addDomListener(window, 'load', initialize);
google.maps.event.addDomListener(window, "resize", function() {
  google.maps.event.trigger(map, "resize");
});

document.onreadystatechange = function(){
 if (document.readyState == "complete") {
    document.body.classList.remove('hide');
  }
};