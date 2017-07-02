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
  self.showPOIInfoLoading = ko.observable(false);
  self.showPOIInfoError = ko.observable(false);

  poi.locations.forEach(p => {
    let nPOI = new POI(p);
    self.availablePOI.set(p.id, nPOI);
    self.filteredPOI.push(nPOI);
  });

  self.setCallbacks = function(
    onPOISelectedCB,
    onPOIFilterChangedCB,
    onResetZoomCB
  ) {
    self.onPOISelected = onPOISelectedCB;
    self.onPOIFilterChanged = onPOIFilterChangedCB;
    self.onResetZoom = onResetZoomCB;

    // call POI filter on start up, to initialize the maps
    self.onPOIFilterChanged(self.filteredPOI());
  };

  self.focusPOIFromMarker = function(id) {
    self.fillInfoWindow(self.availablePOI.get(id));
    if (self.onPOISelected !== undefined)
      self.onPOISelected(self.availablePOI.get(id));
  };

  // focus from html list
  self.focusPOI = function() {
    self.fillInfoWindow(this);

    // notify a possible listener of the POI selection
    if (self.onPOISelected !== undefined) self.onPOISelected(this);
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
    if (self.showPOIInfo()) self.toggleInfoWindow();
    self.showMenu(!self.showMenu());
  };

  self.toggleInfoWindow = () => {
    if (self.showPOIInfo() || self.showPOIInfoError()) {
      // close since we already on screen
      self.showPOIInfo(false);
      self.showMenu(self.menuShownBeforePOIInfo);
      self.showPOIInfoError(false);
      if (self.onResetZoom !== undefined) self.onResetZoom();
    } else {
      self.showPOIInfo(true);
      self.showMenu(false);
    }
  };

  self.navigatePrevious = () => {
    let nextId = self.currentSelectedPOI.data.id - 1;
    if (nextId < 0) nextId = self.availablePOI.size - 1;

    self.fillInfoWindow(self.availablePOI.get(nextId));

    // notify a possible listener of the POI selection
    if (self.onPOISelected !== undefined)
      self.onPOISelected(self.currentSelectedPOI);

    self.poiFilter("");
  };

  self.navigateNext = () => {
    let nextId = self.currentSelectedPOI.data.id + 1;
    if (nextId > self.availablePOI.size - 1) nextId = 0;

    self.fillInfoWindow(self.availablePOI.get(nextId));

    // notify a possible listener of the POI selection
    if (self.onPOISelected !== undefined)
      self.onPOISelected(self.currentSelectedPOI);

    self.poiFilter("");
  };
  self.fillInfoWindow = p => {
    self.showPOIInfoLoading(true);

    self.currentSelectedPOI = p;
    for (let poi of self.availablePOI.values()) poi.selected(false);

    self.showPOIInfoImage(self.currentSelectedPOI.data.wikipedia_img);

    self.menuShownBeforePOIInfo = self.showMenu();
    self.showMenu(false);

    // get Wikipedia entry extract
    // https://en.wikipedia.org/w/api.php?action=help&modules=query%2Bextracts
    $.getJSON(
      "http://de.wikipedia.org/w/api.php?action=query&format=json&callback=?",
      {
        titles: self.currentSelectedPOI.data.wikipedia,
        prop: "extracts",
        exchars: "175"
      },
      function(data) {
        self.showPOIInfoLoading(false);
        self.showPOIInfoError(false);
        self.showPOIInfo(true);

        let page = data.query.pages[Object.keys(data.query.pages)[0]];
        self.showPOIInfoTitle(page.title);
        self.showPOIInfoLongText(page.extract);
        self.showPOIInfoWikipedialink(
          "http://de.wikipedia.org/wiki/" +
            self.currentSelectedPOI.data.wikipedia
        );
      }
    ).fail(function() {
      self.showPOIInfoLoading(false);
      self.showMenu(false);
      self.showPOIInfoError(true);
    });
  };
};
