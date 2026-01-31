#  Place Searches Stay organized with collections  Save and categorize content based on your preferences. 
The **Place Searches** sample demonstrates how to use the `findPlaceFromQuery()[](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlacesService.findPlaceFromQuery)` method to locate a place, and then create and add a marker for it to the map.
Read the [documentation](https://developers.google.com/maps/documentation/javascript/places#place_searches).
### TypeScript
```
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

let map: google.maps.Map;
let service: google.maps.places.PlacesService;
let infowindow: google.maps.InfoWindow;

function initMap(): void {
  const sydney = new google.maps.LatLng(-33.867, 151.195);

  infowindow = new google.maps.InfoWindow();

  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: sydney,
    zoom: 15,
  });

  const request = {
    query: "Museum of Contemporary Art Australia",
    fields: ["name", "geometry"],
  };

  service = new google.maps.places.PlacesService(map);

  service.findPlaceFromQuery(
    request,
    (
      results: google.maps.places.PlaceResult[] | null,
      status: google.maps.places.PlacesServiceStatus
    ) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        for (let i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }

        map.setCenter(results[0].geometry!.location!);
      }
    }
  );
}

function createMarker(place: google.maps.places.PlaceResult) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });

  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(place.name || "");
    infowindow.open(map);
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
[index.ts](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/samples/place-search/index.ts#L8-L69)

```
**Note:** Read the [guide](https://developers.google.com/maps/documentation/javascript/using-typescript) on using TypeScript and Google Maps. 
### JavaScript
```
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
let map;
let service;
let infowindow;

function initMap() {
  const sydney = new google.maps.LatLng(-33.867, 151.195);

  infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById("map"), {
    center: sydney,
    zoom: 15,
  });

  const request = {
    query: "Museum of Contemporary Art Australia",
    fields: ["name", "geometry"],
  };

  service = new google.maps.places.PlacesService(map);
  service.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      for (let i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }

      map.setCenter(results[0].geometry.location);
    }
  });
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });

  google.maps.event.addListener(marker, "click", () => {
    infowindow.setContent(place.name || "");
    infowindow.open(map);
  });
}

window.initMap = initMap;
[index.js](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/place-search/docs/index.js#L7-L54)

```
**Note:** The JavaScript is compiled from the TypeScript snippet. 
### CSS
```
/* 
 * Always set the map height explicitly to define the size of the div element
 * that contains the map. 
 */
#map {
  height: 100%;
}

/* 
 * Optional: Makes the sample page fill the window. 
 */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

[style.css](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/place-search/docs/style.css#L7-L24)

```

### HTML
```
<html>
  <head>
    <title>Place Searches</title>

    <link rel="stylesheet" type="text/css" href="./style.css" />
    <script type="module" src="./index.js"></script>
  </head>
  <body>
    <div id="map"></div>

    <!-- 
      The `defer` attribute causes the script to execute after the full HTML
      document has been parsed. For non-blocking uses, avoiding race conditions,
      and consistent behavior across browsers, consider loading using Promises. See
      https://developers.google.com/maps/documentation/javascript/load-maps-js-api
      for more information.
      -->
    <script
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&libraries=places&v=weekly"
      defer
    ></script>
  </body>
</html>
index.html[](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/place-search/docs/index.html#L8-L30)

```

###  Try Sample 
[JSFiddle.net](https://jsfiddle.net/gh/get/library/pure/googlemaps/js-samples/tree/master/dist/samples/place-search/jsfiddle) [Google Cloud Shell](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fgooglemaps%2Fjs-samples&cloudshell_git_branch=sample-place-search&cloudshell_tutorial=cloud_shell_instructions.md&cloudshell_workspace=.)
### Clone Sample
Git and Node.js are required to run this sample locally. Follow these [instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install Node.js and NPM. The following commands clone, install dependencies and start the sample application. 
```
  git clone -b sample-place-search https://github.com/googlemaps/js-samples.git
  cd js-samples
  npm i
  npm start
```

Other samples can be tried by switching to any branch beginning with `sample-SAMPLE_NAME`. 
```
  git checkout sample-SAMPLE_NAME
  npm i
  npm start
```

Send feedback 
Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
Last updated 2026-01-27 UTC.
Need to tell us more?  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-27 UTC."],[],["This code uses the `findPlaceFromQuery()` method to search for a specified place, in this case, \"Museum of Contemporary Art Australia.\" Upon finding the location, it creates a marker on the map at the place's geometry location. An info window is also created which display the name of the place when the marker is clicked. The map is then centered on the found location.\n"]] 
  * [ ![Stack Overflow](https://developers.google.com/static/site-assets/logo-stack-overflow.svg) Stack Overflow  ](http://stackoverflow.com/questions/tagged/google-maps)
Ask a question under the google-maps tag.
  * [ ![GitHub](https://developers.google.com/static/site-assets/logo-github.svg) GitHub  ](https://github.com/googlemaps/)
Fork our samples and try them yourself.
  * [ ![Discord](https://developers.google.com/static/maps/images/discord-color.png) Discord  ](https://discord.gg/f4hvx8Rp2q)
Chat with fellow developers about Google Maps Platform.
  * [ ![Issue Tracker](https://developers.google.com/static/site-assets/developers_64dp.png) Issue Tracker  ](https://issuetracker.google.com/issues/new?component=188853&template=788207)
Something wrong? Send us a bug report!


  * ### Learn More
    * [ FAQ ](https://developers.google.com/maps/faq)
    * [ Capabilities Explorer ](https://developers.google.com/maps/documentation/capabilities-explorer)
    * [ Tutorials ](https://developers.google.com/maps/documentation/javascript/tutorials)
  * ### Platforms
    * [ Android ](https://developers.google.com/maps/apis-by-platform#android)
    * [ iOS ](https://developers.google.com/maps/apis-by-platform#ios)
    * [ Web ](https://developers.google.com/maps/apis-by-platform#web_apis)
    * [ Web Services ](https://developers.google.com/maps/apis-by-platform#web_service_apis)
  * ### Product Info
    * [ Pricing and Plans ](https://developers.google.com/maps/pricing-and-plans)
    * [ Contact Sales ](https://cloud.google.com/contact-maps/)
    * [ Support ](https://developers.google.com/maps/support/)
    * [ Terms of Service ](https://cloud.google.com/maps-platform/terms)


[ ![Google Developers](https://www.gstatic.com/devrel-devsite/prod/v6dcfc5a6ab74baade852b535c8a876ff20ade102b870fd5f49da5da2dbf570bd/developers/images/lockup-google-for-developers.svg) ](https://developers.google.com/)
  * [ Android ](https://developer.android.com)
  * [ Chrome ](https://developer.chrome.com/home)
  * [ Firebase ](https://firebase.google.com)
  * [ Google Cloud Platform ](https://cloud.google.com)
  * [ Google AI ](https://ai.google.dev/)
  * [ All products ](https://developers.google.com/products)


  * [ Terms ](https://developers.google.com/terms/site-terms)
  * [ Privacy ](https://policies.google.com/privacy)
  * [ Manage cookies ](https://developers.google.com/maps/documentation/javascript/examples/place-search)


  * English
  * Deutsch
  * Español
  * Français
  * Indonesia
  * Português – Brasil
  * Русский
  * 中文 – 简体
  * 日本語
  * 한국어


