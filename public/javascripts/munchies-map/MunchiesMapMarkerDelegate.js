var MunchiesMapMarkerDelegate = function(map){
  var self          = {};
  self.map          = map;
  self.infoWindows  = { 
    count : 0, 
    trucks : {} 
  };

  _(self).extend(MunchiesMapMarkerDelegateMethods, null, self);
  
  return self;
};
