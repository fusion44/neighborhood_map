const poi = require("./data.js");
const ko = require("knockout");

exports.POIViewModel = function(onPOISelectedCB, onPOIFilterChangedCB) {
  self = this;
  self.poiFilter = ko.observable("");
  self.filteredPOI = ko.observableArray(poi.locations.slice());

  self.setCallbacks = function(onPOISelectedCB, onPOIFilterChangedCB) {
    self.onPOISelected = onPOISelectedCB;
    self.onPOIFilterChanged = onPOIFilterChangedCB;

    // call POI filter on start up, to initialize the maps
    self.onPOIFilterChanged(poi.locations);
  };

  self.focusPOI = function() {
    if (self.onPOISelected !== undefined) self.onPOISelected(this);

    self.currentPOI = this;
  };

  // react to changed to the filter input
  self.poiFilter.subscribe(newValue => {
    self.filteredPOI.removeAll();
    poi.locations.forEach(p => {
      if (p.title.toLowerCase().includes(newValue.toLowerCase()))
        self.filteredPOI.push(p);
    });

    // notify maps to update the markers
    if (self.onPOIFilterChanged !== undefined)
      self.onPOIFilterChanged(self.filteredPOI());
  });
};
