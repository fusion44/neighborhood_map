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
    vmodel.setCallbacks(
      selectionChangedCallback,
      filterChangedCallback,
      resetZoomCallback
    );
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
      if (markers.get(poi.data.id) !== undefined) {
        // marker already created for id, just set existing marker to visible
        markers.get(poi.data.id).setMap(map);
      } else {
        let marker = new google.maps.Marker({
          position: poi.data.latlong,
          map: map,
          title: poi.data.title
        });

        marker.addListener("click", function() {
          map.setCenter(marker.getPosition());
          map.setZoom(15);
          vmodel.focusPOIFromMarker(poi.data.id);
        });

        markers.set(poi.data.id, marker);
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
  markers.get(selectedPOI.data.id).setAnimation(google.maps.Animation.DROP);
  map.setCenter(markers.get(selectedPOI.data.id).getPosition());
};

/**
 * Receives the date after filter is applied
 * @param {Arrary} filteredPOI An array with the raw data
 */
let filterChangedCallback = function(filteredPOI) {
  // POI filter changed ==> adjust the map
  updatePOIToMaps(filteredPOI);
};

let resetZoomCallback = () => {
  map.setZoom(6);
  map.setCenter({ lat: 51, lng: 9 });
};

let vmodel = new vm.POIViewModel();
ko.applyBindings(vmodel);

import "../css/main.css";
