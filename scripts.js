/**
 * Points of Interest
 * Steven Nash
 * 2025/04/16
 */
let map, infoWindow, service, poiMarker, userMarker, directionsRenderer, firstOpen;
const defaultLocation = { lat: 43.657999, lng: -79.379139 };
var userLoc = defaultLocation;

async function initMap() {
  // Set a boolean for whether to open the welcome message
  firstOpen = true;

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 6,
  });
  // Create a new info window
  infoWindow = new google.maps.InfoWindow();
  // Create a new PlacesService object
  service = new google.maps.places.PlacesService(map);

  // Create new DirectionsRenderer for routing
  directionsRenderer = new google.maps.DirectionsRenderer();

  // Create a button at the top of the map for reinitializing geolocation
  const geolocButton = document.createElement("button");
  geolocButton.classList.add("geoloc-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(geolocButton);

  // Add an event listener for the geolocation button
  geolocButton.addEventListener("click", () => {
    // Remove any previous geolocation marker
    if(userMarker)
      userMarker.setMap(null);
    // Try geolocation
    geoLoc();
  });

  // Create a Places Autocomplete widget
  const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
  placeAutocomplete.id = 'place-autocomplete-input';
  placeAutocomplete.locationBias = defaultLocation;
  const searchBox = document.createElement("search");
  searchBox.classList.add("search-box");
  searchBox.appendChild(placeAutocomplete);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchBox);

  // Add an event listener for the search box
  placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
    const place = placePrediction.toPlace();
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
    // If the place has a geometry, then present it on a map.
    if (place.viewport) {
        map.fitBounds(place.viewport);
    }
    else {
        // Create an object with the user's location
        userLoc = place.location;

        // Remove any previous geolocation marker
        userMarker.setMap(null);

        // Create a new marker on the user's location
        userMarker = new google.maps.Marker({
          position: userLoc,
          map: map,
          title: 'Your location'
        });
        
        // Set the map's center to the user's location and zoom in
        map.setCenter(userLoc);
        map.setZoom(14);
    }
});

  // Create a selector at the top of the map for category of point of interest
  const poiSelector = document.createElement("select");
  poiSelector.add(new Option("Select a Point of Interest", "none"));
  poiSelector.add(new Option("Monument", "monument"));
  poiSelector.add(new Option("Museum", "museum"));
  poiSelector.add(new Option("Art Gallery", "art_gallery"));
  poiSelector.add(new Option("Historical Place", "historical_place"));
  poiSelector.add(new Option("Cultural Landmark", "cultural_landmark"));
  poiSelector.add(new Option("Library", "library"));
  poiSelector.add(new Option("City Hall", "city_hall"));
  poiSelector.classList.add("custom-map-control-select");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(poiSelector);

  // Create a button at the top of the map for finding nearby points of interest
  const searchPOIButton = document.createElement("button");
  searchPOIButton.textContent = "Find Nearest Point of Interest";
  searchPOIButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchPOIButton);

  // Try geolocation
  geoLoc();
  
  // Search for nearby points of interest when the button is clicked
  searchPOIButton.addEventListener("click", () => {
    const poiCategory = poiSelector.value;
    // Handle the case where the user hasn't selected a category
    if (poiCategory === "none") {
      alert("Please select a point of interest category.");
      return;
    }
    // Search for nearby places of the selected category
    searchNearbyPlaces(poiCategory);
  });

  // Create a button at the top of the map for reopening the welcome message
  const infoButton = document.createElement("button");
  infoButton.classList.add("info-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoButton);

  // Create an event listener for the info button
  infoButton.addEventListener("click", () => {
    welcomeMessage();
  });
}

// Welcome messaeg
function welcomeMessage() {
  // If a marker is set on the user's location (for the first time), add a welcome message
    // Set the info window's position to the user's marker location
    infoWindow.setPosition(userLoc);
    // Set the info window content to a welcome message
    infoWindow.setContent("<div id=welcome-content> <h1 class=welcome-header>Points of Interest 2.0</h1> <h3 class=welcome-header>This application allows you to locate nearby points of interest.</h3><p>With the search bar on the top, make use of our new Autocomplete widget to select the location you would like to search from. Otherwise, click the button to its left to use geolocation to set it to your currrent location. <br /> <br /> After you have your desired location, pick from one of the categories and select Find Nearest Point of Interest to use Nearby Search to find the nearest point of interest to your location. <br /> <br />You will then see a popup with information about the nearest point of interest, as well as a button that lets you use Street View to see the location in 3D.<br /> <br />You can now use the Directions button to use the Directions API to find the quickest route from your location to the point of interest. You can also use the dropdown selector to choose which method of transportation to use in the routing.<br /> <br />At the bottom of the popups, you can now flip between the nearest points of interest from the search. Just click the Next button to flip to the next POI, or the Previous button to return to the previous POI.<br /> <br />Thank you,<br /> <br /> - Steven Nash, 2025/04/16</p></div>");
    // Add an offset to place the popup slightly above the marker
    infoWindow.setOptions({
      pixelOffset: new google.maps.Size(0, -40)
    });
    // Open the info window
    infoWindow.open(map);

    // Set firstOpen to false to prevent another welcome message
    firstOpen = false;
}

// Function to get the user's location using geolocation
async function geoLoc() {
  // Try geolocation
  if (navigator.geolocation) {
    // Get the user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Create an object with the user's location
        userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Create a new marker on the user's location
        userMarker = new google.maps.Marker({
          position: userLoc,
          map: map,
          title: 'Your location'
        });
        
        // Set the map's center to the user's location and zoom in
        map.setCenter(userLoc);
        map.setZoom(14);

        if(firstOpen)
          welcomeMessage();
      },
      // Handle errors when trying to get the user's location
      () => {
        handleLocationError(true, infoWindow, defaultLocation);
      },
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, defaultLocation);
  }
}

// Create a poiMarker
async function addPOIMarker(place) {
  // Create a new marker for the point of interest in the search result
  poiMarker = new google.maps.Marker({
    position: place.location,
    map: map,
    title: place.displayName,
  });

  // Allow the user to reopen the info window by clicking the marker
  poiMarker.addListener("click", () => {
    infoWindow.open(map);
  });

  // Show an info window with the name, description, and website of the point of interest (if available)
  infoWindow.setPosition(place.location);
  infoWindow.setContent("<div id='main-info'><p class='locationInfo'>" + "<h3 class='locationTitle'>" + (place.displayName || "") + "</h3>" + "<h4 class='address'>" + (place.formattedAddress || "") + "</h4>" + (place.editorialSummary || "") + "<br /><br />" + "<a target='_blank' href='" + (place.websiteURI || "") + "'>" + (place.websiteURI || "") + "</a></p><div id='location-buttons'><button id=streetViewButton type=button> Street View</button><select id=directionsSelector></select><button id=directionsButton type=button> Directions </button></div></div><div id='nav-buttons'><button id='prev-button'>Previous</button><button id='next-button'>Next</button></div>");

  // Open the info window
  infoWindow.open(map);
  
  // Add an offset to place the popup slightly above the marker
  infoWindow.setOptions({
    pixelOffset: new google.maps.Size(0, -40)
  });

  // Wait for DOM to be ready. Otherwise the first search's button won't work
  google.maps.event.addListenerOnce(infoWindow, "domready", function () {
    // Populate the directions method seletor
    const directionsSelector = document.getElementById("directionsSelector");
    // If the select element is found
    if(directionsSelector) {
      // Append the options to the list
      directionsSelector.add(new Option("Driving", "DRIVING", true));
      directionsSelector.add(new Option("Biking", "BICYCLING"));
      directionsSelector.add(new Option("Transit", "TRANSIT"));
      directionsSelector.add(new Option("Walking", "WALKING"));
    }

    // Allow the user to view the street view of the point of interest
    const streetViewButton = document.getElementById("streetViewButton");
    // Make sure the button exists
    if (streetViewButton) {
      streetViewButton.addEventListener("click", () => {
        const panorama = new google.maps.StreetViewPanorama(document.getElementById("map"), {
          position: place.location,
          pov: {
            heading: 34,
            pitch: 10,
          },
          controls: true,
          enableCloseButton: true,
        });
        map.setStreetView(panorama);
      });
    }
  });
}

// Function to search for a route from the user's location and the search result
async function getRoute(place, method) {
  // Create service and renderer from the Directions API
  const directionsService = new google.maps.DirectionsService();
  // Remove existing route
  directionsRenderer.setMap(null);
  directionsRenderer.setDirections({routes: []});

  // Create a directions request using the user's location and selected method
  const request = {
    origin: userLoc,
    destination: place.location,
    travelMode: method
  }

  // Make the request
  directionsService.route(request, (result, status) => {
    if(status == 'OK') {
      const route = result.routes[0];
      directionsRenderer.setDirections(result);
      // Set the renderer to the map
      directionsRenderer.setMap(map);
    }
    else
      alert("Directions unavailable.");
  });
}

// Function to search for nearby places of the user's chosen category
async function searchNearbyPlaces(poiCategory) {
  // Remove any currently displayed route
  directionsRenderer.setMap(null);
  directionsRenderer.setDirections({routes: []});

  // Import the Place class
  const { Place } = await google.maps.importLibrary(
    "places",
  );

  // Create a LatLng object with the location parameter
  let center = new google.maps.LatLng(userLoc)
  // Create a request object searching within a 50km radius of the user's location
  const request = {
    fields: ["displayName", "location", "editorialSummary", "websiteURI", "formattedAddress"],
    locationRestriction: {
      radius: 50000,
      center: center,
    },
    includedPrimaryTypes: [poiCategory],
    maxResultCount: 10,
    rankPreference: "DISTANCE",
  };
  // Make the search request to the Places API
  const { places } = await Place.searchNearby(request);
  console.log("Sending search request: ", request);

  // If there is a result
  if(places.length) {
    console.log(places);
    // Create an index to be used for Previous and Next buttons
    var placesIndex = 0;

    // Import the LatLngBounds class and create a new bounds object
    const { LatLngBounds } = await google.maps.importLibrary("core");
    const bounds = new LatLngBounds();

    addPOIMarker(places[0]);

    // Add event listener for the Next button
    // Wait for DOM to be ready
    google.maps.event.addListener(infoWindow, "domready", function () {
      const nextButton = document.getElementById("next-button");
      // Make sure the button exists
      if (nextButton) {
        // Disable the button if at the end of the list
        if(placesIndex == places.length - 1)
          nextButton.disabled = true;
        else
          nextButton.disabled = false;

        nextButton.addEventListener("click", () => {
          // Increment placesIndex if it's less than the number of results
          if(placesIndex < places.length - 1)
            placesIndex++;

          // Delete the current poiMarker
          poiMarker.setMap(null);
          // Create a new marker for the next point of interest
          addPOIMarker(places[placesIndex]);

          // Extend the map bounds to include the point of interest
          bounds.extend(places[placesIndex].location);
        });
      }
    });

    // Add event listener for the Prev button
    // Wait for DOM to be ready
    google.maps.event.addListener(infoWindow, "domready", function () {
      const prevButton = document.getElementById("prev-button");
      // Make sure the button exists
      if (prevButton) {
        // Disable the button if at the beginning of the list
        if(placesIndex == 0)
          prevButton.disabled = true;
        else
          prevButton.disabled = false;

        prevButton.addEventListener("click", () => {
          // Deincrement placesIndex if it's above zero
          if(placesIndex > 0)
            placesIndex--;
          
          // Delete the current poiMarker
          poiMarker.setMap(null);
          // Create a new marker for the previous point of interest
          addPOIMarker(places[placesIndex]);

          // Extend the map bounds to include the point of interest
          bounds.extend(places[placesIndex].location);
        });
      }
    });

    // Add event listeneer for the Directions button
    // Wait for DOM to be ready
    google.maps.event.addListenerOnce(infoWindow, "domready", function () {
      // Get the directions button
      const directionsButton = document.getElementById("directionsButton");
      // Get the directions method selector
      const directionsSelector = document.getElementById("directionsSelector");
      // Make sure the button exists
      if (directionsButton && directionsSelector) {
        directionsButton.addEventListener("click", () => {
          // Get the route of the current place using the selected method
          getRoute(places[placesIndex], directionsSelector.value);
          // Close the info window as to not block the route
          infoWindow.close(map);
        });
      }
      else
        console.log("Directions button not found.");
    });

    // Extend the map bounds to include the point of interest
    bounds.extend(places[0].location);
  } else { // If there is no point of interest found in the search radius
    console.log("No nearby POI found");
    alert("No nearby point of interest found.");
  }
}

// Function to handle errors when trying to get the user's location
function handleLocationError(browserHasGeolocation, infoWindow, location) {
  map.setCenter(location);
  infoWindow.setPosition(location);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.",
  );
  alert("Error: Please enable geolocation and reload.");
}

window.initMap = initMap;
