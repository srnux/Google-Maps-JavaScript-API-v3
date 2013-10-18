var map;
var directionsDisplay;
var directionsService;
var stepDisplay;
var userOrigin;
var markerArray = [];

function initialize() {
  // Instantiate a directions service.
  directionsService = new google.maps.DirectionsService();

  // Create a map and center it on Rijeka.
  var rijeka = new google.maps.LatLng(45.326565, 14.441425);
  var mapOptions = {
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.WALKING,
    center: rijeka
  };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Create a renderer for directions and bind it to the map.
    var rendererOptions = {
        map: map,
        suppressMarkers: true
    };
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions); // Instantiate an info window to hold step text.
  stepDisplay = new google.maps.InfoWindow();

}

function calcRoute(origin, destinations) {

    userOrigin = new google.maps.LatLng(origin.Lat, origin.Lon);
    
    // First, remove any existing markers from the map.
    for (var j = 0; j < markerArray.length; j++) {
        markerArray[j].setMap(null);
    }

    // Now, clear the array itself.
    markerArray = [];
    
    //mark origin and destination on the map
    var markerOrigin = new google.maps.Marker({
        position: userOrigin,
        map: map,
        icon: "http://maps.google.com/mapfiles/kml/paddle/go.png",
        title: "Starting point"
    });

    for (var k = 0; k < destinations.Activity.length; k++) {
        var destination = destinations.Activity[k];
        var currentPosition = new google.maps.LatLng(destination.Lat, destination.Lon);
        switch (destination.Category)
        {
            case "sport":
                var markerSport = new google.maps.Marker({
                    position: currentPosition,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/kml/shapes/play.png',
                    title: destination.Title
                });
                attachRecalculateDirection(markerSport);
                attachInstructionText(markerSport, destination.Description);
                break;
            case "culture":
                var markerCulture = new google.maps.Marker({
                    position:  currentPosition,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/kml/shapes/arts.png',
                    title: destination.Title
                });
                attachRecalculateDirection(markerCulture);
                attachInstructionText(markerCulture, destination.Description);
                break;
        }
    }

  // Retrieve the start and end locations and create
  // a DirectionsRequest using WALKING directions.
    calculateDirection(new google.maps.LatLng(origin.Lat, origin.Lon),
        new google.maps.LatLng(destinations.Activity[0].Lat, destinations.Activity[0].Lon));

}

function calculateDirection(origin, destination) {
    var request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING
    };

    //// Route the directions and pass the response to a
    //// function to create markers for each step.
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            //var warnings = document.getElementById('warnings_panel');
            //warnings.innerHTML = '<b>' + response.routes[0].warnings + '</b>';

            directionsDisplay.setDirections(response);
            showSteps(response);
            //show panel
            directionsDisplay.setPanel(document.getElementById('panel'));
        }
    });
   
}

function showSteps(directionResult) {
  // For each step, place a marker, and add the text to the marker's
  // info window. Also attach the marker to an array so we
  // can keep track of it and remove it when calculating new
  // routes.
  var myRoute = directionResult.routes[0].legs[0];

  for (var i = 0; i < myRoute.steps.length; i++) {
    var marker = new google.maps.Marker({
      position: myRoute.steps[i].start_point,
      map: map,
      
    });
    attachInstructionText(marker, myRoute.steps[i].instructions);
    markerArray[i] = marker;
  }
}

function attachInstructionText(marker, text) {
  google.maps.event.addListener(marker, 'click', function() {
    // Open an info window when the marker is clicked on,
    // containing the text of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}

function attachRecalculateDirection(marker) {
    google.maps.event.addListener(marker, 'click', function () {
        // First, remove any existing markers from the map.
        for (var j = 0; j < markerArray.length; j++) {
            markerArray[j].setMap(null);
            console.log(markerArray[j]);
        }

        // Now, clear the array itself.
        markerArray = [];
        calculateDirection(userOrigin, new google.maps.LatLng(marker.position.lat(), marker.position.lng()));
    });
}

google.maps.event.addDomListener(window, 'load', initialize);