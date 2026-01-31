# Vue en superposition WebGL Restez organisé à l'aide des collections Enregistrez et classez les contenus selon vos préférences.

[Voir un exemple](https://developers.google.com/maps/documentation/javascript/examples/webgl/webgl-overlay-simple?hl=fr)
Avec la vue en superposition WebGL, vous pouvez ajouter du contenu à vos cartes en utilisant WebGL directement, ou à l'aide de bibliothèques graphiques populaires comme Three.js. La vue en superposition WebGL offre un accès direct au même contexte de rendu WebGL que celui utilisé par Google Maps Platform pour afficher la carte de base vectorielle. Utiliser un contexte de rendu partagé offre plusieurs avantages tels que l'occlusion de la profondeur avec la géométrie de bâtiments 3D et la possibilité de synchroniser le contenu 2D/3D avec le rendu de carte de base. Les objets affichés avec la vue en superposition WebGL peuvent également être liés aux coordonnées de latitude/longitude. Ils se déplacent donc lorsque vous faites glisser la carte, que vous zoomez, que vous faites un panoramique ou que vous inclinez la carte.

## Conditions requises

Pour utiliser la vue en superposition WebGL, vous devez charger la carte à l'aide d'un ID de carte et activer la carte vectorielle. Nous vous recommandons vivement d'activer l'inclinaison et la rotation lorsque vous créez l'ID de carte, afin de permettre un contrôle total de la caméra 3D. [Consultez la présentation pour en savoir plus.](https://developers.google.com/maps/documentation/javascript/webgl?hl=fr)

## Ajouter une vue en superposition WebGL

Pour ajouter la superposition à votre carte, implémentez `google.maps.WebGLOverlayView`, puis transmettez-lui votre instance de carte à l'aide de `setMap` :

```
// Create a map instance.
const map = new google.maps.Map(mapDiv, mapOptions);

// Create a WebGL Overlay View instance.
const webglOverlayView = new google.maps.WebGLOverlayView();

// Add the overlay to the map.
webglOverlayView.setMap(map);

```

## Hooks du cycle de vie

La vue en superposition WebGL fournit un ensemble de hooks qui sont appelés à différents moments du cycle de vie du contexte de rendu WebGL de la carte de base vectorielle. Ces hooks de cycle de vie vous permettent de configurer, de dessiner et d'effacer des éléments de la superposition à afficher.

- **`onAdd()`**est appelé lorsque la superposition est créée. Utilisez-le pour extraire ou créer, avant que la superposition ne soit dessinée, des structures de données intermédiaires qui ne nécessitent pas d'accès immédiat au contexte de rendu WebGL.
- **`onContextRestored({gl})`**est appelé une fois que le contexte de rendu est disponible. Utilisez-le pour initialiser ou lier n'importe quel état WebGL, tel que les nuanceurs, les objets de tampon GL, etc.`onContextRestored()` utilise une instance `WebGLStateOptions`, qui ne comporte qu'un seul champ :
  - `gl` est un handle vers le `WebGLRenderingContext` utilisé par la carte de base.
- **`onDraw({gl, transformer})`**affiche la scène sur la carte de base.`onDraw()` prend en paramètre un objet `WebGLDrawOptions` qui comporte deux champs :
  - `gl` est un handle vers le `WebGLRenderingContext` utilisé par la carte de base.
  - `transformer` fournit des fonctions d'assistance permettant de transformer des coordonnées cartographiques en matrice de projection de vue de modèle qui traduit des coordonnées de carte en un espace mondial, un espace de caméra et un espace d'écran.
- **`onContextLost()`**est appelé lorsque le contexte de rendu est perdu pour une raison quelconque. C'est là que vous devez nettoyer tout état GL préexistant, car vous n'en avez plus besoin.
- **`onStateUpdate({gl})`**met à jour l'état GL en dehors de la boucle de rendu et est appelé lorsque`requestStateUpdate` est appelé. Il prend une instance `WebGLStateOptions`, qui ne comporte qu'un seul champ :
  - `gl` est un handle vers le `WebGLRenderingContext` utilisé par la carte de base.
- **`onRemove()`**est appelé lorsque la superposition est supprimée de la carte avec`WebGLOverlayView.setMap(null)`. C'est là que vous devez supprimer tous les objets intermédiaires.

Par exemple, voici une implémentation de base de tous les hooks de cycle de vie :

```
const webglOverlayView = new google.maps.WebGLOverlayView();

webglOverlayView.onAdd = () => {
  // Do setup that does not require access to rendering context.
}

webglOverlayView.onContextRestored = ({gl}) => {
  // Do setup that requires access to rendering context before onDraw call.
}

webglOverlayView.onStateUpdate = ({gl}) => {
  // Do GL state setup or updates outside of the render loop.
}

webglOverlayView.onDraw = ({gl, transformer}) => {
  // Render objects.
}

webglOverlayView.onContextLost = () => {
  // Clean up pre-existing GL state.
}

webglOverlayView.onRemove = () => {
  // Remove all intermediate objects.
}

webglOverlayView.setMap(map);

```

## Réinitialiser l'état GL

La vue en superposition WebGL expose le contexte de rendu WebGL de la carte de base. Pour cette raison, il est extrêmement important de rétablir l'état GL d'origine lorsque vous avez terminé le rendu des objets. Si vous ne le faites pas, des conflits d'état GL peuvent se produire, ce qui empêchera la carte et tous les objets que vous spécifiez de s'afficher.
La réinitialisation de l'état de la carte GL est normalement opérée dans le hook `onDraw()`. Par exemple, Three.js fournit une fonction d'assistance qui efface toutes les modifications de l'état GL :

```
webglOverlayView.onDraw = ({gl, transformer}) => {
  // Specify an object to render.
  renderer.render(scene, camera);
  renderer.resetState();
}

```

Si la carte ou vos objets ne s'affichent pas, il est très probable que l'état GL n'ait pas été réinitialisé.

## Transformations des coordonnées

La position d'un objet sur la carte vectorielle est spécifiée en combinant les coordonnées de latitude et de longitude, ainsi que l'altitude. Toutefois, les graphiques 3D sont spécifiés dans l'espace du monde, de la caméra ou de l'écran. Pour transformer plus facilement les coordonnées de carte en ces espaces plus couramment utilisés, la vue en superposition WebGL fournit la fonction d'assistance `coordinateTransformer.fromLatLngAltitude(latLngAltitude, rotationArr, scalarArr)` du hook `onDraw()` qui prend ce qui suit et renvoie un `Float64Array` :

- `latLngAltitude` : coordonnées de latitude/longitude/altitude au format `LatLngAltitude` ou `LatLngAltitudeLiteral`
- `rotationArr` : `Float32Array` des angles de rotation de l'Euler spécifiés en degrés
- `scalarArr` : `Float32Array` des scalaires à appliquer à l'axe cardinal

Par exemple, le code suivant utilise `fromLatLngAltitude()` pour créer une matrice de projection de caméra dans Three.js :

```
const camera = new THREE.PerspectiveCamera();
const matrix = coordinateTransformer.fromLatLngAltitude({
    lat: mapOptions.center.lat,
    lng: mapOptions.center.lng,
    altitude: 120,
});
camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

```

## Exemple

Voici un exemple simple d'utilisation de [Three.js](https://threejs.org), une bibliothèque WebGL Open Source populaire, pour placer un objet 3D sur la carte. Pour découvrir en détail comment utiliser la vue en superposition WebGL pour reproduire l'exemple en haut de cette page, suivez l'[atelier de programmation "Créer des expériences de carte plus fluides avec WebGL"](http://goo.gle/maps-platform-webgl-codelab).

```
const webglOverlayView = new google.maps.WebGLOverlayView();
let scene, renderer, camera, loader;

webglOverlayView.onAdd = () => {
  // Set up the Three.js scene.
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.75 ); // Soft white light.
  scene.add(ambientLight);

  // Load the 3D model with GLTF Loader from Three.js.
  loader = new GLTFLoader();
  loader.load("pin.gltf");
}

webglOverlayView.onContextRestored = ({gl}) => {
  // Create the Three.js renderer, using the
  // maps's WebGL rendering context.
  renderer = new THREE.WebGLRenderer({
    canvas: gl.canvas,
    context: gl,
    ...gl.getContextAttributes(),
  });
  renderer.autoClear = false;
}

webglOverlayView.onDraw = ({gl, transformer}) => {
  // Update camera matrix to ensure the model is georeferenced correctly on the map.
  const matrix = transformer.fromLatLngAltitude({
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: 120,
  });
camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

  // Request a redraw and render the scene.
  webglOverlayView.requestRedraw();
  renderer.render(scene, camera);

  // Always reset the GL state.
  renderer.resetState();
}

// Add the overlay to the map.
webglOverlayView.setMap(map);

```

Envoyer des commentaires
Sauf indication contraire, le contenu de cette page est régi par une licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), et les échantillons de code sont régis par une licence [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). Pour en savoir plus, consultez les [Règles du site Google Developers](https://developers.google.com/site-policies?hl=fr). Java est une marque déposée d'Oracle et/ou de ses sociétés affiliées.
Dernière mise à jour le 2026/01/28 (UTC).
Voulez-vous nous donner plus d'informations ? [[["Facile à comprendre","easyToUnderstand","thumb-up"],["J'ai pu résoudre mon problème","solvedMyProblem","thumb-up"],["Autre","otherUp","thumb-up"]],[["Il n'y a pas l'information dont j'ai besoin","missingTheInformationINeed","thumb-down"],["Trop compliqué/Trop d'étapes","tooComplicatedTooManySteps","thumb-down"],["Obsolète","outOfDate","thumb-down"],["Problème de traduction","translationIssue","thumb-down"],["Mauvais exemple/Erreur de code","samplesCodeIssue","thumb-down"],["Autre","otherDown","thumb-down"]],["Dernière mise à jour le 2026/01/28 (UTC)."],[],[]]

- [ ![Stack Overflow](https://developers.google.com/static/site-assets/logo-stack-overflow.svg?hl=fr) Stack Overflow ](http://stackoverflow.com/questions/tagged/google-maps)
  Posez une question sous le tag google-maps.
- [ ![GitHub](https://developers.google.com/static/site-assets/logo-github.svg?hl=fr) GitHub ](https://github.com/googlemaps/)
  Explorez nos exemples et essayez-les par vous-même.
- [ ![Discord](https://developers.google.com/static/maps/images/discord-color.png?hl=fr) Discord ](https://discord.gg/f4hvx8Rp2q)
  Discutez de Google Maps Platform avec d'autres développeurs.
- [ ![Outil de suivi des problèmes](https://developers.google.com/static/site-assets/developers_64dp.png?hl=fr) Outil de suivi des problèmes ](https://issuetracker.google.com/issues/new?component=188853&%3Btemplate=788207&hl=fr)
  Un problème ? Envoyez-nous un rapport de bug !

- ### En savoir plus
  - [ Questions fréquentes ](https://developers.google.com/maps/faq)
  - [ Sélecteur d'API ](https://developers.google.com/maps/documentation/api-picker)
  - [ Tutoriels ](https://developers.google.com/maps/documentation/javascript/tutorials)
- ### Plates-formes
  - [ Android ](https://developers.google.com/maps/apis-by-platform#android)
  - [ iOS ](https://developers.google.com/maps/apis-by-platform#ios)
  - [ Web ](https://developers.google.com/maps/apis-by-platform#web_apis)
  - [ Services Web ](https://developers.google.com/maps/apis-by-platform#web_service_apis)
- ### Infos produits
  - [ Tarifs et forfaits ](https://developers.google.com/maps/pricing-and-plans)
  - [ Contacter le service commercial ](https://cloud.google.com/contact-maps/)
  - [ Assistance ](https://developers.google.com/maps/support/)
  - [ Conditions d'utilisation ](https://cloud.google.com/maps-platform/terms)

[ ![Google Developers](https://www.gstatic.com/devrel-devsite/prod/v6dcfc5a6ab74baade852b535c8a876ff20ade102b870fd5f49da5da2dbf570bd/developers/images/lockup-google-for-developers.svg) ](https://developers.google.com/?hl=fr)

- [ Android ](https://developer.android.com?hl=fr)
- [ Chrome ](https://developer.chrome.com/home?hl=fr)
- [ Firebase ](https://firebase.google.com?hl=fr)
- [ Google Cloud Platform ](https://cloud.google.com?hl=fr)
- [ Google AI ](https://ai.google.dev/?hl=fr)
- [ Tous les produits ](https://developers.google.com/products?hl=fr)

- [ Conditions d'utilisation ](https://developers.google.com/terms/site-terms?hl=fr)
- [ Règles de confidentialité ](https://policies.google.com/privacy?hl=fr)
- [ Manage cookies ](https://developers.google.com/maps/documentation/javascript/webgl/webgl-overlay-view?hl=fr)

- English
- Deutsch
- Español
- Español – América Latina
- Français
- Indonesia
- Italiano
- Polski
- Português – Brasil
- Tiếng Việt
- Türkçe
- Русский
- עברית
- العربيّة
- فارسی
- हिंदी
- বাংলা
- ภาษาไทย
- 中文 – 简体
- 中文 – 繁體
- 日本語
- 한국어
