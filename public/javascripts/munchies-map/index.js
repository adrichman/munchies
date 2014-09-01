(function($){

  'use strict';

  var map;
  var zoomLevel = 17;
  var n = 10;
  var dist;

  var pendingUrls = [];
  var inDragState = false;
  var dragTime = 0;
  var timeDiff = 0;
  var mapPlaceholder = document.getElementById('mapPlaceholder');
  var lastCoords;
  var center = { pinned : false };
  var initialize = function(){
    if (navigator.geolocation){
      return navigator.geolocation.getCurrentPosition(showCurrentLocation);
    } else {
      alert("Geolocation API not supported.");
    }
  };
  var calculateDist = function(){
    // http://stackoverflow.com/questions/3525670/radius-of-viewable-region-in-google-maps-v3
    var bounds = map.getBounds();

    var center = bounds.getCenter();
    var ne = bounds.getNorthEast();

    // r = radius of the earth in statute miles
    var r = 3963.0;  

    // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
    var lat1 = center.lat() / 57.2958; 
    var lon1 = center.lng() / 57.2958;
    var lat2 = ne.lat() / 57.2958;
    var lon2 = ne.lng() / 57.2958;

    // distance = circle radius from center to Northeast corner of bounds
    var dis = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) + 
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));
    return dis / 2;
  };
  var nearbyTruckQueue = [];
  var renderedTrucks = { lastRequest : null };
  var infoWindows = { count : 0 };


  var compileTemplate = function(truck){
    if (truck){
      var foodList = "";
      _.forEach(truck.fooditems.split(': '), function(food){
        foodList += "<li>"+ food.trim() +"</li>"
      });
    
      var template =  "<div class=\"info-window\" data-truck-id=\"" + truck._id + "\">"+
                          "<div>" +
                              "<div style=\"font-weight: 700\">" + truck.applicant + "</div>" +
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
    var name = truck.applicant.split(/(dba. )|(DBA )|(DBA: )/);
    truckName.innerText = name[name.length - 1];
    
    var truckAddress = document.createElement('td');
    truckAddress.classList.add('truckAddress');
    truckAddress.innerText = truck.locationdescription;
    
    truckRow.appendChild(truckName);
    truckRow.appendChild(truckAddress);
    truckList.appendChild(truckRow);
  };

  var displayNewTrucks = function(n){
    var truck;
    var truckList = document.getElementById('truckList');
    truckList.classList.add('list-unstyled');
    var nextDisplayed = nearbyTruckQueue.splice(0,n);
    var i = 1;
    while (i <= n){
      setTimeout(function(){
        truck = nextDisplayed.shift();
        createTruckMarker(truck);
        truckList && addToTruckList(truckList, truck);
      }, i * 200);
      i++;
    }
  }

  var lastRequestTime = lastRequestTime || 0;
  var requestNearby = function(dist, n, coords){

    // throttle the number of ajax requests
    if (Date.now() - lastRequestTime > 300) {
      lastRequestTime = Date.now();
      var coords = coords || map.getCenter();
      
      var jqxhr = function(){
        return $.get("api/v1/trucks/?lng="+ coords.B +"&lat="+ coords.k +"&dist=" + dist, function(data){
          _.forEach(data, function(truck){
            if (renderedTrucks[truck._id]) return;
            nearbyTruckQueue.push(truck);
            renderedTrucks[truck._id] = 1;
          }) 
        });
      };
      
      var renderCallback = function(){
        nearbyTruckQueue.length && displayNewTrucks(n);  
      };
      
      if (renderedTrucks.lastRequest === coords) {
        renderCallback();
      } else {
        jqxhr().done(renderCallback);
        renderedTrucks.lastRequest = map.getCenter();
      }
    }
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
  };

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
      zoom: zoomLevel,
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

    var overlay = addMapLoadListener();
    
    overlay.on("overlay-idle", function(){
      if (document.getElementById('centerMarker') === null){
        // renderCenterStaticMarker();
        !center.pinned && pinCenter();
        dist = calculateDist();
        !inDragState && requestNearby(dist, n);
      }
    })

    google.maps.event.addListener(map, 'mousedown', function(e){ 
      inDragState = !inDragState;
      dragTime = Date.now();
    });

    google.maps.event.addListener(map, 'mouseup', function(e){ 
      inDragState = !inDragState;
      timeDiff = Date.now() - dragTime;
      map.panTo(map.getCenter());
    });

    google.maps.event.addListener(map, 'center_changed', function(e) {
      var coords;
      if (!inDragState || timeDiff > 150){ 
        coords = map.getCenter();
        dist = calculateDist();
        dragTime = 0;
        timeDiff = 0;
        if (lastCoords !== coords) {
          requestNearby(dist, n, coords);
          lastCoords = coords;
        }
      }
    });
    google.maps.event.addListener(map, 'zoom_changed', function(e) {
      zoomLevel = map.getZoom();
      dist = calculateDist();
      lastCoords = map.getCenter();
      requestNearby(dist, n, lastCoords);
    });
  };

  google.maps.event.addDomListener(window, 'load', initialize);
  google.maps.event.addDomListener(window, "resize", function() {
    google.maps.event.trigger(map, "resize");
  });
})($);