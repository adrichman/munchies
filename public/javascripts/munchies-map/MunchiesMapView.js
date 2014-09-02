var MunchiesMapView = function(options){
  var self              = this;
  this.map              = null;
  this.markerDelegate   = null;
  this.lastRequestTime  = 0;
  this.nearbyTruckQueue = [];
  this.pendingUrls      = [];

  this.zoomLevel        = options.zoomLevel || 16;
  this.n                = options.n || 10;
  this.dist             = options.dist || .02;
  this.lastCoords       = options.lastCoords || null;
  this.center           = { pinned : false };
  
  this.dragDelegate     = new MunchiesMapDragDelegate();
  
  this.mapPlaceholder   = document.getElementById('mapPlaceholder');
  this.truckList        = document.getElementById('truckList');

  /* Check for GeoLocation Support and render map*/
  if (navigator.geolocation){ 
    navigator.geolocation.getCurrentPosition(function(position){
    
      var latitude    = position.coords.latitude;
      var longitude   = position.coords.longitude;
      self.lastCoords = new google.maps.LatLng(latitude, longitude);
      
      self.renderMap({
          zoom          : self.zoomLevel,
          center        : self.lastCoords,
          mapTypeControl: true,
          mapTypeId     : google.maps.MapTypeId.ROADMAP,
          bounceDuration: 1400
      },  options.centerPinPath);
    })
  } else { 
    alert("Geolocation API not supported.") 
  }
};

MunchiesMapView.prototype.displayNewTrucks = function(n){
  var i = 1, truck;
  var self          = this;
  var nextDisplayed = self.nearbyTruckQueue.splice(0,n);
  
  self.truckList.classList.add('list-unstyled');
  
  while (i <= n){
    setTimeout(function(){
      truck = nextDisplayed.shift();
      self.markerDelegate.createTruckMarker(truck);
      self.truckList && self.addToTruckList(truck);
    }, i * 200);
    i++;
  }
};

MunchiesMapView.prototype.requestNearby = function(dist, n, coords){
  // throttle the number of ajax requests
  var self = this;
  if (Date.now() - this.lastRequestTime > 300) {
    this.lastRequestTime = Date.now();
    var coords           = coords || this.map.googleMap.getCenter();
    
    var jqxhr = function(){
      return $.get(
        "api/v1/trucks/?lng="+ coords.B +"&lat="+ coords.k +"&dist=" + dist, function(data){
          _(data).forEach(function(truck){
            if (self.map.renderedTrucks[truck._id]) return;
            self.nearbyTruckQueue.push(truck);
            self.map.renderedTrucks[truck._id] = 1;
          }) 
      });
    };
    
    var renderCallback = function(){
      self.nearbyTruckQueue.length && self.displayNewTrucks.call(self, n);  
    };
    
    if (self.map.renderedTrucks.lastRequestCoords === coords) {
      renderCallback();
    } else {
      jqxhr().done(renderCallback);
      self.map.renderedTrucks.lastRequestCoords = this.map.googleMap.getCenter();
    }
  }
};

MunchiesMapView.prototype.renderMap = function(mapOptions, centerPinPath){
  //create the map, and place it in the HTML map div   
  var self               = this;
  this.map               = new MunchiesMap(this.mapPlaceholder,mapOptions);
  this.markerDelegate    = MunchiesMapMarkerDelegate(this.map);

  var addMapLoadListener = function(){
    // http://stackoverflow.com/questions/7341769/google-maps-v3-how-to-tell-when-an-imagemaptype-overlays-tiles-are-finished-lo

    var index = 0;   
    var urls  = [ "http://placekitten.com/256/256", 
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
        self.pendingUrls.push(url);

        // if this is our first pending tile, signal that we just became busy
        if (self.pendingUrls.length === 1) {
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

    // Copy the original getTile function we can override it, 
    // but still make use of the original function
    overlay.baseGetTile = overlay.getTile;

    // Override getTile so we may add event listeners to know when the images load
    overlay.getTile = function(tileCoord, zoom, ownerDocument) {

      // Get the DOM node generated by the out-of-the-box ImageMapType
      var node = overlay.baseGetTile(tileCoord, zoom, ownerDocument);

      // Listen for any images within the node to finish loading
      $("img", node).one("load", function() {

          // Remove the image from our list of pending urls
          var index = $.inArray(this.__src__, self.pendingUrls);
          self.pendingUrls.splice(index, 1);

          // If the pending url list is empty, emit an event to 
          // indicate that the tiles are finished loading
          if (self.pendingUrls.length === 0) {
            $(overlay).trigger("overlay-idle");
          }
      });

      return node;
    };

    self.map.googleMap.overlayMapTypes.push(overlay);
    return $(overlay);
  };

  var overlay = addMapLoadListener();
  overlay.on("overlay-idle", function(){
    if (document.getElementById('centerMarker') === null){
      !self.center.pinned && self.pinCenter(centerPinPath);
      self.dist = self.map.calculateDist();
      !self.dragDelegate.inDragState && self.requestNearby(self.dist, self.n);
    }
  })

  google.maps.event.addListener(self.map.googleMap, 'mousedown', function(e){ 
    self.dragDelegate.inDragState = !self.dragDelegate.inDragState;
    self.dragDelegate.dragTime = Date.now();
  });

  google.maps.event.addListener(self.map.googleMap, 'mouseup', function(e){ 
    self.dragDelegate.inDragState = !self.dragDelegate.inDragState;
    self.dragDelegate.timeDiff = Date.now() - self.dragDelegate.dragTime;
    self.map.googleMap.panTo(self.map.googleMap.getCenter());
  });

  google.maps.event.addListener(self.map.googleMap, 'center_changed', function(e) {
    var coords;
    if (!self.dragDelegate.inDragState || self.dragDelegate.timeDiff > 150){ 
      coords = self.map.googleMap.getCenter();
      self.dist = self.map.calculateDist();
      self.dragDelegate.dragTime = 0;
      self.dragDelegate.timeDiff = 0;
      if (self.lastCoords !== coords) {
        self.requestNearby(self.dist, self.n, coords);
        self.lastCoords = coords;
      }
    }
  });
  google.maps.event.addListener(self.map.googleMap, 'zoom_changed', function(e) {
    self.zoomLevel = self.map.googleMap.getZoom();
    self.dist = self.map.calculateDist();
    self.lastCoords = self.map.googleMap.getCenter();
    self.requestNearby(self.dist, self.n, self.lastCoords);
  });

};

MunchiesMapView.prototype.pinCenter = function(path){
  var self    = this;
  var pinIcon = new google.maps.MarkerImage(path);
  var coords  = this.map.googleMap.getCenter();
  
  var pinnedCenterMarker = new google.maps.Marker({
    position: coords,
    map: this.map.googleMap,
    title: "Current Location",
    draggable: true,
    icon: pinIcon
  });

  this.center.pinned = true;
  this.center.infoWindow = false;

  var infoWindow = new google.maps.InfoWindow({
    content : "<div class=\"info-window\">You Are Here!</div>"
  });

  google.maps.event.addListener(pinnedCenterMarker, 'mouseup', function(){
    self.map.googleMap.panTo(pinnedCenterMarker.getPosition());
  })
  
  google.maps.event.addListener(pinnedCenterMarker, 'click', function(){
    if (!self.center.infoWindow){
      infoWindow.open(self.map.googleMap,pinnedCenterMarker);
    } else {
      infoWindow.close();
      infoWindow.content = "<div>I'm Different</div>";
    }
    self.center.infoWindow = !self.center.infoWindow;
  })
};