#  Éléments géographiques vectoriels Restez organisé à l'aide des collections  Enregistrez et classez les contenus selon vos préférences. 
Sélectionnez une plate-forme : [Android](https://developers.google.com/maps/documentation/android-sdk/views?hl=fr "Consultez cette page pour accéder à la documentation sur la plate-forme Android.") [iOS](https://developers.google.com/maps/documentation/ios-sdk/views?hl=fr "Consultez cette page pour accéder à la documentation sur la plate-forme iOS.") [JavaScript](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr "Consultez cette page pour accéder à la documentation sur la plate-forme JavaScript.")
[Voir un exemple](https://developers.google.com/maps/documentation/javascript/examples/webgl/webgl-tilt-rotation?hl=fr)
L'API Maps JavaScript propose deux implémentations de carte différentes : la carte matricielle et la carte vectorielle. La carte matricielle charge la carte sous forme de grille de tuiles d'images matricielles basées sur des pixels, qui sont générées côté serveur par Google Maps Platform, puis diffusées dans votre application Web. La carte vectorielle est composée de tuiles vectorielles, qui sont dessinées au moment du chargement côté client à l'aide de WebGL, une technologie Web qui permet au navigateur d'accéder au GPU de l'appareil de l'utilisateur pour afficher des graphiques 2D et 3D.
La carte vectorielle est la même carte Google que celle que vos utilisateurs connaissent. Elle offre de nombreux avantages par rapport à la carte matricielle par défaut, par exemple en ce qui concerne la netteté des images vectorielles et l'ajout de bâtiments 3D à des niveaux de zoom rapprochés. La carte vectorielle est compatible avec les fonctionnalités suivantes :
  * [Contrôle programmatique de l'inclinaison et de l'orientation](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#tilt-rotation)
  * [Contrôle amélioré de la caméra](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#control-camera)
  * [Zoom fractionnaire pour un zoom plus fluide](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#fractional-zoom)
  * [Contenus et animations 3D](https://developers.google.com/maps/documentation/javascript/webgl/webgl-overlay-view?hl=fr)
  * Pour les cartes chargées à l'aide d'un élément `div` et de JavaScript, le type de rendu par défaut est `google.maps.RenderingType.RASTER`.
  * Pour les cartes chargées à l'aide de l'élément `gmp-map`, le type de rendu par défaut est `google.maps.RenderingType.VECTOR`, avec le contrôle de l'inclinaison et du cap activé.


[Premiers pas avec les cartes vectorielles](https://developers.google.com/maps/documentation/javascript/webgl?hl=fr)
## Inclinaison et rotation
Vous pouvez définir l'inclinaison et la rotation (orientation) sur la [carte vectorielle](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr) en intégrant les propriétés `heading` et `tilt` lors de l'initialisation de la carte, et en appelant les méthodes `setTilt` et `setHeading` sur la carte. L'exemple suivant ajoute à la carte des boutons qui affichent le réglage programmatique de l'inclinaison et de l'orientation par incréments de 20 degrés.
### TypeScript
```
function initMap(): void {
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: {
        lat: 37.7893719,
        lng: -122.3942,
      },
      zoom: 16,
      heading: 320,
      tilt: 47.5,
      mapId: "90f87356969d889c",
    }
  );

  const buttons: [string, string, number, google.maps.ControlPosition][] = [
    ["Rotate Left", "rotate", 20, google.maps.ControlPosition.LEFT_CENTER],
    ["Rotate Right", "rotate", -20, google.maps.ControlPosition.RIGHT_CENTER],
    ["Tilt Down", "tilt", 20, google.maps.ControlPosition.TOP_CENTER],
    ["Tilt Up", "tilt", -20, google.maps.ControlPosition.BOTTOM_CENTER],
  ];

  buttons.forEach(([text, mode, amount, position]) => {
    const controlDiv = document.createElement("div");
    const controlUI = document.createElement("button");

    controlUI.classList.add("ui-button");
    controlUI.innerText = `${text}`;
    controlUI.addEventListener("click", () => {
      adjustMap(mode, amount);
    });
    controlDiv.appendChild(controlUI);
    map.controls[position].push(controlDiv);
  });

  const adjustMap = function (mode: string, amount: number) {
    switch (mode) {
      case "tilt":
        map.setTilt(map.getTilt()! + amount);
        break;
      case "rotate":
        map.setHeading(map.getHeading()! + amount);
        break;
      default:
        break;
    }
  };
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
[index.ts](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/samples/webgl-tilt-rotation/index.ts#L8-L62)

```
**Remarque** : Consultez [ce guide](https://developers.google.com/maps/documentation/javascript/using-typescript?hl=fr) sur l'utilisation de TypeScript et Google Maps. 
### JavaScript
```
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 37.7893719,
      lng: -122.3942,
    },
    zoom: 16,
    heading: 320,
    tilt: 47.5,
    mapId: "90f87356969d889c",
  });
  const buttons = [
    ["Rotate Left", "rotate", 20, google.maps.ControlPosition.LEFT_CENTER],
    ["Rotate Right", "rotate", -20, google.maps.ControlPosition.RIGHT_CENTER],
    ["Tilt Down", "tilt", 20, google.maps.ControlPosition.TOP_CENTER],
    ["Tilt Up", "tilt", -20, google.maps.ControlPosition.BOTTOM_CENTER],
  ];

  buttons.forEach(([text, mode, amount, position]) => {
    const controlDiv = document.createElement("div");
    const controlUI = document.createElement("button");

    controlUI.classList.add("ui-button");
    controlUI.innerText = `${text}`;
    controlUI.addEventListener("click", () => {
      adjustMap(mode, amount);
    });
    controlDiv.appendChild(controlUI);
    map.controls[position].push(controlDiv);
  });

  const adjustMap = function (mode, amount) {
    switch (mode) {
      case "tilt":
        map.setTilt(map.getTilt() + amount);
        break;
      case "rotate":
        map.setHeading(map.getHeading() + amount);
        break;
      default:
        break;
    }
  };
}

window.initMap = initMap;
[index.js](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/webgl-tilt-rotation/docs/index.js#L7-L52)

```
**Remarque** : Le JavaScript est compilé à partir de l'extrait TypeScript. 
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

.ui-button {
  background-color: #fff;
  border: 0;
  border-radius: 2px;
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
  margin: 10px;
  padding: 0 0.5em;
  font: 400 18px Roboto, Arial, sans-serif;
  overflow: hidden;
  height: 40px;
  cursor: pointer;
}
.ui-button:hover {
  background: rgb(235, 235, 235);
}

[style.css](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/webgl-tilt-rotation/docs/style.css#L7-L40)

```

### HTML
```
<html>
  <head>
    <title>Tilt and Rotation</title>

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
      src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly"
      defer
    ></script>
  </body>
</html>
index.html[](https://github.com/googlemaps/js-samples/blob/2683f7366fb27829401945d2a7e27d77ed2df8e5/dist/samples/webgl-tilt-rotation/docs/index.html#L8-L30)

```

###  Essayer avec un exemple 
[JSFiddle.net](https://jsfiddle.net/gh/get/library/pure/googlemaps/js-samples/tree/master/dist/samples/webgl-tilt-rotation/jsfiddle) [Google Cloud Shell](https://ssh.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fgooglemaps%2Fjs-samples&cloudshell_git_branch=sample-webgl-tilt-rotation&cloudshell_tutorial=cloud_shell_instructions.md&cloudshell_workspace=.&hl=fr)
### Utiliser les gestes de la souris et du clavier
Si les interactions utilisateur d'inclinaison et de rotation (cap) ont été activées (de manière programmatique ou dans la console Google Cloud), les utilisateurs peuvent ajuster l'inclinaison et la rotation à l'aide de la souris et du clavier :
  * **Si vous utilisez la souris** : maintenez la touche Maj enfoncée, puis faites glisser la souris vers le haut ou le bas pour ajuster l'inclinaison, et vers la droite ou la gauche pour ajuster l'orientation.
  * **Si vous utilisez le clavier** : maintenez la touche Maj enfoncée, puis utilisez les flèches vers le haut ou le bas pour ajuster l'inclinaison, et les flèches vers la droite ou la gauche pour ajuster l'orientation.


### Ajuster l'inclinaison et l'orientation par programmation
Utilisez les méthodes `setTilt()` et `setHeading()` pour ajuster programmatiquement l'inclinaison et l'orientation d'une carte vectorielle. L'orientation correspond à la direction vers laquelle la caméra est tournée dans le sens des aiguilles d'une montre, en partant du nord. Ainsi, `map.setHeading(90)` fera pivoter la carte de sorte que l'est soit orienté vers le haut. L'angle d'inclinaison est mesuré à partir du zénith. `map.setTilt(0)` équivaut donc à une vue directe vers le bas, tandis que `map.setTilt(45)` génère une vue oblique.
  * Appelez `setTilt()` pour définir l'angle d'inclinaison de la carte. Utilisez `getTilt()` pour obtenir la valeur d'inclinaison actuelle.
  * Appelez `setHeading()` pour définir l'orientation de la carte. Utilisez `getHeading()` pour obtenir la valeur d'orientation actuelle.


Pour modifier le centre de la carte sans changer l'inclinaison ni l'orientation, utilisez `map.setCenter()` ou `map.panBy()`.
Notez que la plage des angles disponibles dépend du niveau de zoom actuel. Les valeurs sortant de cette plage seront limitées à la plage autorisée.
Vous pouvez également utiliser la méthode `moveCamera` pour modifier programmatiquement l'orientation, l'inclinaison, le centre et le zoom. [En savoir plus](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#control-camera)
### Impact sur les autres méthodes
Lorsqu'une inclinaison ou une rotation est appliquée à la carte, cela affecte le comportement des autres méthodes de l'API Maps JavaScript :
  * `map.getBounds()` renvoie toujours le plus petit cadre de délimitation qui comprend la région visible. Lorsqu'une inclinaison est appliquée, les limites renvoyées peuvent représenter une zone plus grande que la région visible de la fenêtre d'affichage de la carte.
  * `map.fitBounds()` réinitialise l'inclinaison et l'orientation à zéro avant d'ajuster les limites.
  * `map.panToBounds()` réinitialise l'inclinaison et l'orientation à zéro avant d'effectuer un panoramique sur les limites.
  * `map.setTilt()` accepte n'importe quelle valeur, mais limite l'inclinaison maximale en fonction du niveau de zoom actuel de la carte.
  * `map.setHeading()` accepte n'importe quelle valeur et la modifie pour s'adapter à la plage `[0, 360]`.


## Contrôler la caméra
Utilisez la fonction `map.moveCamera()` pour mettre à jour simultanément n'importe quelle combinaison de propriétés de la caméra. `map.moveCamera()` accepte un seul paramètre contenant toutes les propriétés de la caméra à mettre à jour. L'exemple suivant montre comment appeler `map.moveCamera()` pour définir simultanément `center`, `zoom`, `heading` et `tilt` :
```
map.moveCamera({
  center: new google.maps.LatLng(37.7893719, -122.3942),
  zoom: 16,
  heading: 320,
  tilt: 47.5
});

```

Vous pouvez animer les propriétés de la caméra en appelant `map.moveCamera()` avec une boucle d'animation, comme indiqué ci-dessous :
```
const degreesPerSecond = 3;

function animateCamera(time) {
  // Update the heading, leave everything else as-is.
  map.moveCamera({
    heading: (time / 1000) * degreesPerSecond
  });

  requestAnimationFrame(animateCamera);
}

// Start the animation.
requestAnimationFrame(animateCamera);

```

## Position de la caméra
La vue de la carte est modélisée comme une **caméra** orientée vers le bas sur une surface plane. La position de la caméra (et par conséquent le rendu de la carte) est indiquée par les propriétés suivantes : [position cible (latitude/longitude)](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#target_location), [orientation](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#bearing_orientation), [inclinaison](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#tilt_viewing_angle) et [zoom](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr#zoom).
![Schéma des propriétés de la caméra](https://developers.google.com/static/maps/documentation/android-sdk/images/camera.png?hl=fr)
### Cible (zone géographique)
La cible de la caméra correspond à la position du centre de la carte, spécifiée en tant que coordonnées de latitude et longitude.
La latitude peut être comprise entre -85 et 85 degrés, inclus. Les valeurs supérieures ou inférieures à cette fourchette seront limitées à la valeur la plus proche dans cette fourchette. Par exemple, si vous spécifiez une latitude de 100, la valeur sera définie sur 85. La longitude est comprise entre -180 et 180 degrés, inclus. Les valeurs supérieures ou inférieures à cette fourchette seront converties pour être incluses dans la fourchette (-180, 180). Par exemple, les valeurs 480, 840 et 1200 seront toutes remplacées par 120 degrés. 
### Orientation
L'orientation de la caméra indique la direction de la boussole, mesurée en degrés depuis le nord géographique et correspondant au bord supérieur de la carte. Si vous tracez une ligne verticale du centre de la carte à son bord supérieur, l'orientation correspond à la direction de la caméra (mesurée en degrés) par rapport au nord géographique.
La valeur d'orientation 0 signifie que le haut de la carte pointe vers le nord géographique. La valeur d'orientation 90 indique que le haut de la carte est orienté plein est (90 degrés sur une boussole). La valeur 180 signifie que le haut de la carte est orienté plein sud.
L'API Google Maps vous permet de modifier l'orientation d'une carte. Par exemple, un conducteur tourne souvent sa carte routière pour l'aligner dans le sens de la route, tandis qu'un randonneur utilisant une carte et une boussole oriente généralement la carte afin qu'une ligne verticale pointe vers le nord.
### Inclinaison (angle de vue)
L'inclinaison définit la position de la caméra sur un arc juste au-dessus du point central de la carte, mesurée en degrés à partir du [nadir](https://en.wikipedia.org/wiki/Nadir) (direction qui pointe juste en dessous de la caméra). La valeur 0 correspond à une caméra orientée à la verticale vers le bas. Une valeur supérieure à 0 correspond à une caméra inclinée vers l'horizon selon le nombre de degrés spécifié. Lorsque vous modifiez l'angle de vue, la carte apparaît en perspective, les éléments cartographiques lointains semblant plus petits, et les plus proches semblant plus grands, comme le montrent les illustrations ci-dessous.
Dans les images ci-dessous, l'angle de vue est de 0 degré. La première image correspond à un plan schématisé ; la position **1** correspond à la position de la caméra et la position **2** à la position actuelle de la carte. La carte qui en résulte est présentée juste en dessous.
![Capture d&#39;écran d&#39;une carte avec une caméra placée à un angle de vue de 0 degrés, avec un niveau de zoom de 18.](https://developers.google.com/static/maps/documentation/android-sdk/images/camera-angle-0-shot.png?hl=fr) Carte affichée avec l'angle de vue par défaut de la caméra |  ![Schéma qui indique la position par défaut de la caméra, directement sur la position de la carte, à un angle de 0 degré.](https://developers.google.com/static/maps/documentation/android-sdk/images/camera_0.png?hl=fr) Angle de vue par défaut de la caméra  
---|---  
Sur les images ci-dessous, l'angle de vue est de 45 degrés. Notez que la caméra se déplace à mi-chemin le long d'un arc entre une ligne verticale perpendiculaire (0 degré) et le sol (90 degrés), jusqu'à la position **3**. La caméra pointe toujours vers le point central de la carte, mais la zone représentée par la ligne en position **4** est maintenant visible.
![Capture d&#39;écran d&#39;une carte avec une caméra placée à un angle de vue de 45 degrés, avec un niveau de zoom de 18.](https://developers.google.com/static/maps/documentation/android-sdk/images/camera-angle-45-shot.png?hl=fr) Carte affichée avec un angle de vue de 45 degrés |  ![Schéma affichant l&#39;angle de vue de la caméra défini sur 45 degrés, avec le niveau de zoom toujours défini sur 18.](https://developers.google.com/static/maps/documentation/android-sdk/images/camera_45.png?hl=fr) Angle de vue de 45 degrés  
---|---  
Sur cette capture d'écran, la carte est toujours centrée sur le même point que sur la carte d'origine, mais d'autres éléments cartographiques ont été ajoutés en haut de la carte. À mesure que vous augmentez l'angle au-delà de 45 degrés, les éléments cartographiques situés entre la caméra et la position de la carte apparaissent proportionnellement plus grands, tandis que ceux situés au-delà de la position de la carte apparaissent proportionnellement plus petits, ce qui donne un effet tridimensionnel.
### Zoom
Le niveau de zoom de la caméra détermine l'échelle de la carte. Plus le niveau de zoom est élevé, plus on peut voir de détails sur la carte ; et inversement, plus le niveau de zoom est faible, plus la partie du monde affichée à l'écran est grande. 
Le niveau de zoom ne doit pas nécessairement être un nombre entier. La fourchette de niveaux de zoom autorisée par la carte dépend d'un certain nombre de facteurs, comme la cible, le type de carte et la taille de l'écran. Tout nombre en dehors de la fourchette sera converti vers la valeur valide la plus proche, qui peut correspondre au niveau de zoom minimal ou maximal. La liste suivante indique le niveau de détail approximatif que vous pouvez vous attendre à voir à chaque niveau de zoom :
  * 1 : Le monde
  * 5 : La masse continentale/Le continent
  * 10 : La ville
  * 15 : Les rues
  * 20 : Les bâtiments

**Remarque** : En raison de la taille de l'écran et de la densité, il se peut que certains appareils ne soient pas compatibles avec les niveaux de zoom les plus bas.  Les images suivantes montrent à quoi ressemblent les différents niveaux de zoom :  ![Capture d&#39;écran d&#39;une carte au niveau de zoom 5](https://developers.google.com/static/maps/documentation/javascript/images/zoom-level-6.png?hl=fr) Carte au niveau de zoom 5 |  ![Capture d&#39;écran d&#39;une carte au niveau de zoom 15](https://developers.google.com/static/maps/documentation/javascript/images/zoom-level-14.png?hl=fr) Carte au niveau de zoom 15 |  ![Capture d&#39;écran d&#39;une carte au niveau de zoom 20](https://developers.google.com/static/maps/documentation/javascript/images/zoom-level-19.png?hl=fr) Carte au niveau de zoom 20  
---|---|---  
## Zoom fractionnaire
Les cartes vectorielles prennent en charge le zoom fractionnaire, qui vous permet d'effectuer un zoom en utilisant des valeurs fractionnaires au lieu d'entiers. Les cartes matricielles comme vectorielles sont compatibles avec le zoom fractionnaire, mais il est activé par défaut seulement dans les cartes vectorielles, et non dans les cartes matricielles. Utilisez l'option de carte `isFractionalZoomEnabled` pour activer et désactiver le zoom fractionnaire.
L'exemple suivant montre comment activer le zoom fractionnaire lors de l'initialisation de la carte :
```
map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: -34.397, lng: 150.644},
  zoom: 8,
  **isFractionalZoomEnabled: true**
});

```

Vous pouvez également activer ou désactiver le zoom fractionnaire en définissant l'option de carte `isFractionalZoomEnabled`, comme indiqué ci-dessous :
```
// Using map.set
map.set('isFractionalZoomEnabled', true);

// Using map.setOptions
map.setOptions({isFractionalZoomEnabled: true});

```

Vous pouvez configurer un écouteur pour détecter si le zoom fractionnaire est activé. C'est utile si vous n'avez pas défini explicitement `isFractionalZoomEnabled` sur `true` ou `false`. L'exemple de code suivant vérifie si le zoom fractionnaire est activé :
```
map.addListener('isfractionalzoomenabled_changed', () => {
  const isFractionalZoomEnabled = map.get('isFractionalZoomEnabled');
  if (isFractionalZoomEnabled === false) {
    console.log('not using fractional zoom');
  } else if (isFractionalZoomEnabled === true) {
    console.log('using fractional zoom');
  } else {
    console.log('map not done initializing yet');
  }
});

```
**Attention** : L'événement `zoom_changed` se déclenche plus fréquemment lorsque le zoom fractionnaire est activé. Cela aura une incidence sur tous les écouteurs configurés pour suivre `zoom_changed`. Pour des performances optimales, nous vous conseillons de ne mettre à jour cet événement que si le zoom a été modifié d'une valeur entière ou bien d'appliquer une limitation.
Envoyer des commentaires 
Sauf indication contraire, le contenu de cette page est régi par une licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), et les échantillons de code sont régis par une licence [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). Pour en savoir plus, consultez les [Règles du site Google Developers](https://developers.google.com/site-policies?hl=fr). Java est une marque déposée d'Oracle et/ou de ses sociétés affiliées.
Dernière mise à jour le 2026/01/28 (UTC).
Voulez-vous nous donner plus d'informations ?  [[["Facile à comprendre","easyToUnderstand","thumb-up"],["J'ai pu résoudre mon problème","solvedMyProblem","thumb-up"],["Autre","otherUp","thumb-up"]],[["Il n'y a pas l'information dont j'ai besoin","missingTheInformationINeed","thumb-down"],["Trop compliqué/Trop d'étapes","tooComplicatedTooManySteps","thumb-down"],["Obsolète","outOfDate","thumb-down"],["Problème de traduction","translationIssue","thumb-down"],["Mauvais exemple/Erreur de code","samplesCodeIssue","thumb-down"],["Autre","otherDown","thumb-down"]],["Dernière mise à jour le 2026/01/28 (UTC)."],[],[]] 
  * [ ![Stack Overflow](https://developers.google.com/static/site-assets/logo-stack-overflow.svg?hl=fr) Stack Overflow  ](http://stackoverflow.com/questions/tagged/google-maps)
Posez une question sous le tag google-maps.
  * [ ![GitHub](https://developers.google.com/static/site-assets/logo-github.svg?hl=fr) GitHub  ](https://github.com/googlemaps/)
Explorez nos exemples et essayez-les par vous-même.
  * [ ![Discord](https://developers.google.com/static/maps/images/discord-color.png?hl=fr) Discord  ](https://discord.gg/f4hvx8Rp2q)
Discutez de Google Maps Platform avec d'autres développeurs.
  * [ ![Outil de suivi des problèmes](https://developers.google.com/static/site-assets/developers_64dp.png?hl=fr) Outil de suivi des problèmes  ](https://issuetracker.google.com/issues/new?component=188853&%3Btemplate=788207&hl=fr)
Un problème ? Envoyez-nous un rapport de bug !


  * ### En savoir plus
    * [ Questions fréquentes ](https://developers.google.com/maps/faq)
    * [ Sélecteur d'API ](https://developers.google.com/maps/documentation/api-picker)
    * [ Tutoriels ](https://developers.google.com/maps/documentation/javascript/tutorials)
  * ### Plates-formes
    * [ Android ](https://developers.google.com/maps/apis-by-platform#android)
    * [ iOS ](https://developers.google.com/maps/apis-by-platform#ios)
    * [ Web ](https://developers.google.com/maps/apis-by-platform#web_apis)
    * [ Services Web ](https://developers.google.com/maps/apis-by-platform#web_service_apis)
  * ### Infos produits
    * [ Tarifs et forfaits ](https://developers.google.com/maps/pricing-and-plans)
    * [ Contacter le service commercial ](https://cloud.google.com/contact-maps/)
    * [ Assistance ](https://developers.google.com/maps/support/)
    * [ Conditions d'utilisation ](https://cloud.google.com/maps-platform/terms)


[ ![Google Developers](https://www.gstatic.com/devrel-devsite/prod/v6dcfc5a6ab74baade852b535c8a876ff20ade102b870fd5f49da5da2dbf570bd/developers/images/lockup-google-for-developers.svg) ](https://developers.google.com/?hl=fr)
  * [ Android ](https://developer.android.com?hl=fr)
  * [ Chrome ](https://developer.chrome.com/home?hl=fr)
  * [ Firebase ](https://firebase.google.com?hl=fr)
  * [ Google Cloud Platform ](https://cloud.google.com?hl=fr)
  * [ Google AI ](https://ai.google.dev/?hl=fr)
  * [ Tous les produits ](https://developers.google.com/products?hl=fr)


  * [ Conditions d'utilisation ](https://developers.google.com/terms/site-terms?hl=fr)
  * [ Règles de confidentialité ](https://policies.google.com/privacy?hl=fr)
  * [ Manage cookies ](https://developers.google.com/maps/documentation/javascript/vector-map?hl=fr)


  * English
  * Deutsch
  * Español
  * Español – América Latina
  * Français
  * Indonesia
  * Italiano
  * Polski
  * Português – Brasil
  * Tiếng Việt
  * Türkçe
  * Русский
  * עברית
  * العربيّة
  * فارسی
  * हिंदी
  * বাংলা
  * ภาษาไทย
  * 中文 – 简体
  * 中文 – 繁體
  * 日本語
  * 한국어


