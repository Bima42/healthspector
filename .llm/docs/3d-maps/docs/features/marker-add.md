#  Ajouter un repère à une carte 3D Restez organisé à l'aide des collections  Enregistrez et classez les contenus selon vos préférences. 
Sélectionnez une plate-forme : [Android](https://developers.google.com/maps/documentation/maps-3d/android-sdk/add-a-marker?hl=fr "Consultez cette page pour accéder à la documentation sur la plate-forme Android.") [iOS](https://developers.google.com/maps/documentation/maps-3d/ios-sdk/add-a-marker?hl=fr "Consultez cette page pour accéder à la documentation sur la plate-forme iOS.") [JavaScript](https://developers.google.com/maps/documentation/javascript/3d/marker-add?hl=fr "Consultez cette page pour accéder à la documentation sur la plate-forme JavaScript.")
Ce produit ou cette fonctionnalité est en phase de preview (pré-DG). La prise en charge des fonctionnalités et produits pré-DG peut être limitée, et il se peut que les modifications apportées à ces fonctionnalités ou produits ne soient pas compatibles avec d'autres versions pré-DG. Les offres en pré-DG sont couvertes par les [Conditions spécifiques du service Google Maps Platform](https://cloud.google.com/maps-platform/terms/maps-service-terms?hl=fr). Pour en savoir plus, consultez les [descriptions des étapes de lancement](https://developers.google.com/maps/launch-stages?hl=fr).
Utilisez des repères pour afficher des lieux uniques sur une carte. Cette page explique comment ajouter un repère à une carte de manière programmatique et en utilisant le HTML.
## Ajouter un repère en utilisant le HTML
Pour ajouter un repère 3D en utilisant le HTML, ajoutez un élément enfant `gmp-marker-3d` à l'élément `gmp-map-3d`. L'extrait suivant illustre comment ajouter des repères sur une page Web :
```
<gmp-map-3d
  mode="hybrid"
  center="48.861000,2.335861"
  heading="110"
  tilt="67.5"
  range="1000"
  style="height:400px"
  >
    <gmp-marker-3d
      position="48.861000,2.335861">
    </gmp-marker-3d>
</gmp-map-3d>

```

## Ajouter un repère de manière programmatique
Pour ajouter un repère 3D à une carte de manière programmatique, créez un `Marker3DElement`, transmettez les coordonnées `lat/lng` et une référence à la carte de base, comme indiqué dans cet exemple :
```
const marker = new Marker3DElement({
  position: {lat: 47.6093, lng: -122.3402}, // (Required) Marker must have a lat/lng.
  altitudeMode : "ABSOLUTE", // (Optional) Treated as CLAMP_TO_GROUND if omitted.
  extruded : true, // (Optional) Draws line from ground to the bottom of the marker.
  label : "Basic Marker" // (Optional) Add a label to the marker.
});

map.append(marker); // The marker must be appended to the map.

```

## Étapes suivantes
  * [Personnalisation des repères de base](https://developers.google.com/maps/documentation/javascript/3d/marker-customization?hl=fr)


Envoyer des commentaires 
Sauf indication contraire, le contenu de cette page est régi par une licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), et les échantillons de code sont régis par une licence [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). Pour en savoir plus, consultez les [Règles du site Google Developers](https://developers.google.com/site-policies?hl=fr). Java est une marque déposée d'Oracle et/ou de ses sociétés affiliées.
Dernière mise à jour le 2025/09/25 (UTC).
Voulez-vous nous donner plus d'informations ?  [[["Facile à comprendre","easyToUnderstand","thumb-up"],["J'ai pu résoudre mon problème","solvedMyProblem","thumb-up"],["Autre","otherUp","thumb-up"]],[["Il n'y a pas l'information dont j'ai besoin","missingTheInformationINeed","thumb-down"],["Trop compliqué/Trop d'étapes","tooComplicatedTooManySteps","thumb-down"],["Obsolète","outOfDate","thumb-down"],["Problème de traduction","translationIssue","thumb-down"],["Mauvais exemple/Erreur de code","samplesCodeIssue","thumb-down"],["Autre","otherDown","thumb-down"]],["Dernière mise à jour le 2025/09/25 (UTC)."],[],[]] 
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
  * [ Manage cookies ](https://developers.google.com/maps/documentation/javascript/3d/marker-add?hl=fr)


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


