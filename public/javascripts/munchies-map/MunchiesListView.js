var MunchiesListView = function(){
  this.truckList = document.getElementById('truckList');
};

MunchiesListView.prototype.addToTruckList = function(truck){
  if (!this.truckList || !truck) return;

  var truckRow            = document.createElement('tr');
  var truckName           = document.createElement('td');
  var truckAddress        = document.createElement('td');
  var name                = truck.applicant.split(/(dba. )|(DBA )|(DBA: )/);
  truckName.innerText     = name[name.length - 1];
  truckAddress.innerText  = truck.locationdescription;
  
  
  truckRow.classList.add('truckRow');
  truckName.classList.add('truckName');
  truckAddress.classList.add('truckAddress');

  truckRow.appendChild(truckName);
  truckRow.appendChild(truckAddress);

  this.truckList.appendChild(truckRow);
};

MunchiesMapView.prototype.addToTruckList =  MunchiesListView.prototype.addToTruckList.bind(this);
