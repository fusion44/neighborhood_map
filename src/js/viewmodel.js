const poi = require("./data.js");
const ko = require("knockout");

var POI = function(data) {
  this.selected = ko.observable(false);
  this.data = data;
};

exports.POIViewModel = function(onPOISelectedCB, onPOIFilterChangedCB) {
  self = this;
  self.poiFilter = ko.observable("");
  self.availablePOI = new Map();
  self.filteredPOI = ko.observableArray([]);
  poi.locations.forEach(p => {
    let nPOI = new POI(p);
    self.availablePOI.set(p.id, nPOI);
    self.filteredPOI.push(nPOI);
  });

  self.setCallbacks = function(onPOISelectedCB, onPOIFilterChangedCB) {
    self.onPOISelected = onPOISelectedCB;
    self.onPOIFilterChanged = onPOIFilterChangedCB;

    // call POI filter on start up, to initialize the maps
    self.onPOIFilterChanged(self.filteredPOI());
  };

  self.focusPOI = function() {
    for (let poi of self.availablePOI.values()) poi.selected(false);
    this.selected(true);

    if (self.onPOISelected !== undefined) self.onPOISelected(this);
  };

  // react to changed to the filter input
  self.poiFilter.subscribe(newValue => {
    self.filteredPOI.removeAll();
    poi.locations.forEach(p => {
      if (p.title.toLowerCase().includes(newValue.toLowerCase())) {
        self.filteredPOI.push(self.availablePOI.get(p.id));
      }
    });

    // notify maps to update the markers
    if (self.onPOIFilterChanged !== undefined)
      self.onPOIFilterChanged(self.filteredPOI());
  });
};
