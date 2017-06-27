const keys = require("./keys.js");

var loadGoogleMapsApi = require("load-google-maps-api-2");
loadGoogleMapsApi.key = keys.mapsAPIKey;

// loads asynchronously
loadGoogleMapsApi()
  .then(function(googleMaps) {
    var myLatlng = { lat: -25.363, lng: 131.044 };

    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: myLatlng
    });

    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: "Click to zoom"
    });

  })
  .catch(function(err) {
    console.log(err);
  });

import "../css/main.css";
