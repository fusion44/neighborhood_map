const keys = require("./keys.js");
const data = require("./data.js");

var loadGoogleMapsApi = require("load-google-maps-api-2");
loadGoogleMapsApi.key = keys.mapsAPIKey;

// loads asynchronously
loadGoogleMapsApi()
  .then(function(googleMaps) {
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: { lat: 51, lng: 9 },
      disableDefaultUI: true
    });

    data.locations.forEach(function(poi) {
      var marker = new google.maps.Marker({
        position: poi.latlong,
        map: map,
        title: poi.title
      });
    }, this);
  })
  .catch(function(err) {
    console.log(err);
  });

import "../css/main.css";
