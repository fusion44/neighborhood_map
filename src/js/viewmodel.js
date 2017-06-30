const poi = require("./data.js");
const ko = require("knockout");

var POI = function(data) {
  this.selected = ko.observable(false);
  this.data = data;
};

exports.POIViewModel = function(onPOISelectedCB, onPOIFilterChangedCB) {
  self = this;
  self.showMenu = ko.observable(true);
  self.poiFilter = ko.observable("");
  self.availablePOI = new Map();
  self.filteredPOI = ko.observableArray([]);

  // Wikipedia POI info
  self.showPOIInfo = ko.observable(false);
  self.showPOIInfoTitle = ko.observable("");
  self.showPOIInfoImage = ko.observable("");
  self.showPOIInfoLongText = ko.observable("");
  self.showPOIInfoWikipedialink = ko.observable("");

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
    self.currentSelectedPOI = this;

    // notify a possible listener of the POI selection
    if (self.onPOISelected !== undefined) self.onPOISelected(this);

    self.showPOIInfoImage(this.data.wikipedia_img);

    // get Wikipedia entry extract
    // https://en.wikipedia.org/w/api.php?action=help&modules=query%2Bextracts
    $.getJSON(
      "http://de.wikipedia.org/w/api.php?action=query&format=json&callback=?",
      { titles: this.data.wikipedia, prop: "extracts", exchars: "175" },
      function(data) {
        let page = data.query.pages[Object.keys(data.query.pages)[0]];
        self.showPOIInfo(true);
        self.menuShownBeforePOIInfo = self.showMenu();
        self.showMenu(false);
        self.showPOIInfoTitle(page.title);
        $(".card-text").replaceWith(page.extract);
        self.showPOIInfoWikipedialink(
          "http://de.wikipedia.org/wiki/" +
            self.currentSelectedPOI.data.wikipedia
        );
      }
    );
  };

  // react to changed to the filter input
  self.poiFilter.subscribe(newValue => {
    if (!self.showMenu()) self.toggleMenu();

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

  self.toggleMenu = () => {
    self.showMenu(!self.showMenu());
  };

  self.toggleInfoWindow = () => {
    if (self.showPOIInfo()) {
      // close since we already on screen
      self.showPOIInfo(false);
      self.showMenu(self.menuShownBeforePOIInfo);
    } else {
      self.showPOIInfo(true);
      self.showMenu(false);
    }
  };
};
