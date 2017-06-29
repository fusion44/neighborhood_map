const keys = require("./keys.js");
const vm = require("./viewmodel.js");
const ko = require("knockout");

// ----- Google Maps API Handling -----
var loadGoogleMapsApi = require("load-google-maps-api-2");
loadGoogleMapsApi.key = keys.mapsAPIKey;

let map = undefined;
let markers = new Map();

// loads asynchronously
loadGoogleMapsApi()
  .then(function(googleMaps) {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: { lat: 51, lng: 9 },
      disableDefaultUI: true
    });

    // Set callbacks once the map is ready for action
    vmodel.setCallbacks(selectionChangedCallback, filterChangedCallback);
  })
  .catch(function(err) {
    console.log(err);
  });

let updatePOIToMaps = function(filteredPOI) {
  for (let m of markers.values()) {
    m.setMap(null);
  }

  ko.utils.arrayForEach(
    filteredPOI,
    poi => {
      if (markers.get(poi.id) !== undefined) {
        // marker already created for id, just set existing marker to visible
        markers.get(poi.id).setMap(map);
      } else {
        markers.set(
          poi.id,
          new google.maps.Marker({
            position: poi.latlong,
            map: map,
            title: poi.title
          })
        );
      }
    },
    this
  );
};

// ----- UI section using knockout -----
/**
 * @param {JSON object} selectedPOI Raw data for the selected poi
 */
let selectionChangedCallback = function(selectedPOI) {
  // A new POI was selected ==> reframe the map
  updatePOIToMaps(selectedPOI);
};

/**
 * Receives the date after filter is applied
 * @param {Arrary} filteredPOI An array with the raw data
 */
let filterChangedCallback = function(filteredPOI) {
  // POI filter changed ==> adjust the map
  updatePOIToMaps(filteredPOI);
};

let vmodel = new vm.POIViewModel();
ko.applyBindings(vmodel);

import "../css/main.css";
