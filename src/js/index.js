const keys = require("./keys.js");
const vm = require("./viewmodel.js");
const ko = require("knockout");

// ----- Google Maps API Handling -----
var loadGoogleMapsApi = require("load-google-maps-api-2");
loadGoogleMapsApi.key = keys.mapsAPIKey;

let map = undefined;
let markers = {};
let info_windows = {};
let mapsOptions = {
  zoom: 6,
  center: { lat: 51, lng: 9 }, // Germany
  disableDefaultUI: true
};

// loads asynchronously
loadGoogleMapsApi()
  .then(function(googleMaps) {
    map = new google.maps.Map(document.getElementById("map"), mapsOptions);

    // Set callbacks once the map is ready for action
    vmodel.setCallbacks(
      selectionChangedCallback,
      filterChangedCallback,
      resetZoomCallback
    );
  })
  .catch(function(err) {
    console.log(err);
    alert("Error initializing Google Maps!");
  });

let updatePOIToMaps = function(filteredPOI) {
  for (let key in markers) {
    if (markers.hasOwnProperty(key)) {
      markers[key].setMap(null);
    }
  }

  ko.utils.arrayForEach(
    filteredPOI,
    poi => {
      if (markers[poi.data.id] !== undefined) {
        // marker already created for id, just set existing marker to visible
        markers[poi.data.id].setMap(map);
      } else {
        let marker = new google.maps.Marker({
          position: poi.data.latlong,
          map: map,
          title: poi.data.title
        });

        marker.addListener("click", function() {
          map.setCenter(marker.getPosition());
          showInfoWindow(poi.data.id);
          vmodel.focusPOIFromMarker(poi.data.id);
        });

        let info_window = new google.maps.InfoWindow({
          content: "<h3>" + poi.data.title + "</h3>"
        });

        markers[poi.data.id] = marker;
        info_windows[poi.data.id] = info_window;
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
  markers[selectedPOI.data.id].setAnimation(google.maps.Animation.DROP);
  map.setCenter(markers[selectedPOI.data.id].getPosition());
  showInfoWindow(selectedPOI.data.id);
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
  map.setZoom(mapsOptions.zoom);
  map.setCenter({ lat: 51, lng: 9 });
};

let showInfoWindow = id => {
  for (let key in info_windows) {
    if (info_windows.hasOwnProperty(key)) {
      info_windows[key].close();
    }
  }

  info_windows[id].open(map, markers[id]);
};

let vmodel = new vm.POIViewModel();
ko.applyBindings(vmodel);

import "../css/main.css";
