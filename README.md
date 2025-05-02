# Points of Interest
### Explores the Google Maps API through an application that finds Points of Interest near a given location.

This application uses the Google Maps API to find the user's location or lets them search for a location of their own, then allows them to select a category of points of interest and search. The application then uses the Places library to find the nearest point of interest of that category within a 50km radius, displaying it on the map with an information bubble.

The information bubble includes information about the POI, and allows the user to click a button to view the Street View of the location. The user can also click a button to use the Directions API to retrieve directions from their location to the POI, and can select a method of transportation from a dropdown selector.
   
The user can also cycle between up to 10 of the nearest POI results from the Nearby Search using the Previous and Next buttons, with the marker and popup changing to the appropriate result.
