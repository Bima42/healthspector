#  WebGL Overlay (native API) Stay organized with collections  Save and categorize content based on your preferences. 
This example demonstrates using the `WebGLOverlayView` to display a 3D image with animation on a vector map.
Read the [documentation](https://developers.google.com/maps/documentation/javascript/webgl/webgl-overlay-view).
### TypeScript
```
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let map: google.maps.Map;

const mapOptions = {
  tilt: 0,
  heading: 0,
  zoom: 18,
  center: { lat: 35.6594945, lng: 139.6999859 },
  mapId: "15431d2b469f209e",
  // disable interactions due to animation loop and moveCamera
  disableDefaultUI: true,
  gestureHandling: "none",
  keyboardShortcuts: false,
};

function initMap(): void {
  const mapDiv = document.getElementById("map") as HTMLElement;
  map = new google.maps.Map(mapDiv, mapOptions);
  initWebglOverlayView(map);
}

function initWebglOverlayView(map: google.maps.Map): void {
  let scene, renderer, camera, loader;
  const webglOverlayView = new google.maps.WebGLOverlayView();

  webglOverlayView.onAdd = () => {
    // Set up the scene.

    scene = new Scene();

    camera = new PerspectiveCamera();

    const ambientLight = new AmbientLight(0xffffff, 0.75); // Soft white light.
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // Load the model.
    loader = new GLTFLoader();
    const source =
      "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";
    loader.load(source, (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.rotation.x = Math.PI; // Rotations are in radians.
      scene.add(gltf.scene);
    });
  };

  webglOverlayView.onContextRestored = ({ gl }) => {
    // Create the js renderer, using the
    // maps's WebGL rendering context.
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;

    // Wait to move the camera until the 3D model loads.
    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        webglOverlayView.requestRedraw();
        const { tilt, heading, zoom } = mapOptions;
        map.moveCamera({ tilt, heading, zoom });

        // Rotate the map 360 degrees.
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5;
        } else if (mapOptions.heading <= 360) {
          mapOptions.heading += 0.2;
          mapOptions.zoom -= 0.0005;
        } else {
          renderer.setAnimationLoop(null);
        }
      });
    };
  };

  webglOverlayView.onDraw = ({ gl, transformer }): void => {
    const latLngAltitudeLiteral: google.maps.LatLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 100,
    };

    // Update camera matrix to ensure the model is georeferenced correctly on the map.
    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
    camera.projectionMatrix = new Matrix4().fromArray(matrix);

    webglOverlayView.requestRedraw();
    renderer.render(scene, camera);

    // Sometimes it is necessary to reset the GL state.
    renderer.resetState();
  };
  webglOverlayView.setMap(map);
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
[index.ts](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/samples/webgl-overlay-simple/index.ts#L8-L133)

```
**Note:** Read the [guide](https://developers.google.com/maps/documentation/javascript/using-typescript) on using TypeScript and Google Maps. 
### JavaScript
```
import {
  AmbientLight,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
let map;
const mapOptions = {
  tilt: 0,
  heading: 0,
  zoom: 18,
  center: { lat: 35.6594945, lng: 139.6999859 },
  mapId: "15431d2b469f209e",
  // disable interactions due to animation loop and moveCamera
  disableDefaultUI: true,
  gestureHandling: "none",
  keyboardShortcuts: false,
};

function initMap() {
  const mapDiv = document.getElementById("map");

  map = new google.maps.Map(mapDiv, mapOptions);
  initWebglOverlayView(map);
}

function initWebglOverlayView(map) {
  let scene, renderer, camera, loader;
  const webglOverlayView = new google.maps.WebGLOverlayView();

  webglOverlayView.onAdd = () => {
    // Set up the scene.
    scene = new Scene();
    camera = new PerspectiveCamera();

    const ambientLight = new AmbientLight(0xffffff, 0.75); // Soft white light.

    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.25);

    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);
    // Load the model.
    loader = new GLTFLoader();

    const source =
      "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";

    loader.load(source, (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.rotation.x = Math.PI; // Rotations are in radians.
      scene.add(gltf.scene);
    });
  };

  webglOverlayView.onContextRestored = ({ gl }) => {
    // Create the js renderer, using the
    // maps's WebGL rendering context.
    renderer = new WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });
    renderer.autoClear = false;
    // Wait to move the camera until the 3D model loads.
    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
        webglOverlayView.requestRedraw();

        const { tilt, heading, zoom } = mapOptions;

        map.moveCamera({ tilt, heading, zoom });
        // Rotate the map 360 degrees.
        if (mapOptions.tilt < 67.5) {
          mapOptions.tilt += 0.5;
        } else if (mapOptions.heading <= 360) {
          mapOptions.heading += 0.2;
          mapOptions.zoom -= 0.0005;
        } else {
          renderer.setAnimationLoop(null);
        }
      });
    };
  };

  webglOverlayView.onDraw = ({ gl, transformer }) => {
    const latLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 100,
    };
    // Update camera matrix to ensure the model is georeferenced correctly on the map.
    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);

    camera.projectionMatrix = new Matrix4().fromArray(matrix);
    webglOverlayView.requestRedraw();
    renderer.render(scene, camera);
    // Sometimes it is necessary to reset the GL state.
    renderer.resetState();
  };

  webglOverlayView.setMap(map);
}

window.initMap = initMap;
[index.js](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/webgl-overlay-simple/docs/index.js#L7-L125)

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

#map {
  pointer-events: none;
}

[style.css](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/webgl-overlay-simple/docs/style.css#L7-L28)

```

### HTML
```
<html>
  <head>
    <title>Simple WebGL Overlay</title>

    <script src="https://unpkg.com/three@0.129.0/build/three.min.js"></script>

    <link rel="stylesheet" type="text/css" href="./style.css" />
    <script type="module" src="./index.js"></script>
  </head>
  <body>
    <div id="map" class="map"></div>

    <!-- 
      The `defer` attribute causes the script to execute after the full HTML
      document has been parsed. For non-blocking uses, avoiding race conditions,
      and consistent behavior across browsers, consider loading using Promises. See
      https://developers.google.com/maps/documentation/javascript/load-maps-js-api
      for more information.
      -->
    <script
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly"
      defer
    ></script>
  </body>
</html>
index.html[](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/webgl-overlay-simple/docs/index.html#L8-L32)

```

###  Try Sample 
[Google Cloud Shell](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fgooglemaps%2Fjs-samples&cloudshell_git_branch=sample-webgl-overlay-simple&cloudshell_tutorial=cloud_shell_instructions.md&cloudshell_workspace=.)
### Clone Sample
Git and Node.js are required to run this sample locally. Follow these [instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install Node.js and NPM. The following commands clone, install dependencies and start the sample application. 
```
  git clone -b sample-webgl-overlay-simple https://github.com/googlemaps/js-samples.git
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
Need to tell us more?  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2026-01-27 UTC."],[],[]] 
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
  * [ Manage cookies ](https://developers.google.com/maps/documentation/javascript/examples/webgl/webgl-overlay-simple)


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


