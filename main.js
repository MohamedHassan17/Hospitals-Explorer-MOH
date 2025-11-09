require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/FeatureLayer",
  "esri/rest/closestFacility",
  "esri/rest/support/ClosestFacilityParameters",
  "esri/rest/support/FeatureSet",
  "esri/widgets/Expand",
  "esri/widgets/BasemapGallery",
  "esri/widgets/Locate",
  "esri/widgets/Home",
  "esri/widgets/Track",
  "esri/layers/RouteLayer",
  "esri/widgets/Directions",
], (
  esriConfig,
  Map,
  MapView,
  Graphic,
  FeatureLayer,
  closestFacility,
  ClosestFacilityParameters,
  FeatureSet,
  Expand,
  BasemapGallery,
  Locate,
  Home,
  Track,
  RouteLayer,
  Directions
) => {
  esriConfig.apiKey =
    //"AAPTxy8BH1VEsoebNVZXo8HurGCoG4qF2DvWXxuqchRiS1I62s4D3V06Oo-tZRkrB38fDIN9Zz6MXKfgr_L8orD1d5U6989xHHivivF5-7Xnjh_NMQKz1N31iV_m9CTaPwMdUcU3LjhsouSQKG2PkA_WMACmrdzdO7bFYk30gHoyBdDYnezX2g0sYnfoXuVUKJng6dC2GxzWmBca9TZ4PkjjsLTnAjcrShfeSl7uF064K-g.AT1_U8fouBBJ";
    "AAPTxy8BH1VEsoebNVZXo8HurMQo9nN_dOaT11qd3VyF6nfSWnnmpoxS4SIUhp_4eYFmSVNdPWZdP0_5a9uJzta3mFcViueF5lf8DHW5KefoZizqvpBVsue7I0HCkrMFi4XjccakjgtL10wBLLgY_G74MD3VxkdxbwsZJ6D4vExJxNQMeR6XgOa3WViTN3cMw4KTg5QhN9wLReZzjQI8-sJqsrzU3DX3tX9iZh340BvnzwM.AT1_J5FVaG6b";
  var label = {
    symbol: {
      type: "text",
      color: "black",
      haloColor: "white",
      haloSize: 1,
      font: {
        family: "Arial",
        size: 12,
        weight: "bold",
      },
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.hospital_nm",
    },
  };

  var layer = new FeatureLayer({
    portalItem: {
      id: "2ac8ab9dea274a1eb5ee62dfcc09b4de",
    },
    visible: false,
    labelingInfo: [label],
  });
  const map = new Map({
    basemap: "arcgis/navigation",
    layers: [layer],
  });

  const view = new MapView({
    map: map,
    center: [31.4591002, 30.0266052],
    zoom: 8,
    container: "viewDiv",
    constraints: { rotationEnabled: false, minScale: 2000000 },
  });

  // widgets
  var basemapGallery = new BasemapGallery({
    view: view,
    container: document.createElement("div"),
  });
  var bgExpand = new Expand({
    view: view,
    content: basemapGallery,
  });
  var locateBtn = new Locate({
    view: view,
  });

  var homeBtn = new Home({
    view: view,
  });

  var track = new Track({
    view: view,
  });

  view.when(() => {
    view.ui.add([bgExpand, homeBtn, track], "top-left");
    view.ui.remove("attribution");
  });

  // close the expand whenever a basemap is selected
  basemapGallery.watch("activeBasemap", function () {
    var mobileSize =
      view.heightBreakpoint === "xsmall" || view.widthBreakpoint === "xsmall";
    if (mobileSize) {
      bgExpand.collapse();
    }
  });

  var routeLayer = new RouteLayer();
  map.add(routeLayer);

  var directionsWidget = new Directions({
    view: view,
    layer: routeLayer,
    label: "Directions",
    visibleElements: {
      layerDetailsLink: false,
      saveAsButton: false,
      saveButton: false,
    },
  });

  var dirExpand = new Expand({
    view: view,
    content: directionsWidget,
    expandTooltip: "Get Directions",
  });

  view.ui.add(dirExpand, {
    position: "top-right",
  });

  // ------------------------------------------ Welcome-----------------------------------------------//
  document.getElementById("startBtn").addEventListener("click", () => {
    const welcome = document.getElementById("welcome");
    document.getElementById("welcome").classList.add("hide");
    welcome.remove();
    setTimeout(() => welcome.remove(), 1000); // remove after fade-out
  });
  //------------------------------------------------------Alert --------------------------------//
  function showAlert(
    kind = "brand",
    title = "Notice",
    message = "",
    buttonLabel = null,
    buttonCallback = null
  ) {
    // Remove any existing alert first (avoid stacking)
    const existing = document.getElementById("dynamic-alert");
    if (existing) existing.remove();

    // Create alert element
    const alert = document.createElement("calcite-alert");
    alert.id = "dynamic-alert";
    alert.className = "bottom-alert";
    alert.kind = kind; // "danger", "warning", "info", "success", "brand"
    alert.icon = "exclamationMarkTriangle";
    alert.scale = "s";
    alert.placement = "bottom-start";
    alert.closable = true;
    alert.open = true;

    alert.style.setProperty("--calcite-alert-width", "320px");
    alert.style.setProperty("--calcite-alert-offset-size", "90px");

    const titleDiv = document.createElement("div");
    titleDiv.slot = "title";
    titleDiv.textContent = title;
    alert.appendChild(titleDiv);

    const msgDiv = document.createElement("div");
    msgDiv.slot = "message";
    msgDiv.textContent = message;
    alert.appendChild(msgDiv);

    // Optional action button
    // if (buttonLabel) {
    //   const btn = document.createElement("calcite-button");
    //   btn.slot = "actions";
    //   btn.scale = "s";
    //   btn.appearance = "outline";
    //   btn.textContent = buttonLabel;

    //   if (buttonCallback && typeof buttonCallback === "function") {
    //     btn.addEventListener("click", buttonCallback);
    //   }

    //   alert.appendChild(btn);
    // }

    // Add alert to page
    document.body.appendChild(alert);
  }
  //---------------------------------------------------------------------------------------------
  view.when(() => {
    const go = document.getElementById("startBtn");
    const alert = document.getElementById("locationAlert");
    const enableLocationBtn = document.getElementById("enableLocationBtn");

    function requestLocation() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert.open = false;
          showPosition(position);
          view.when(() => {
            track.geolocationOptions = {
              enableHighAccuracy: true,
              maximumAge: 60000,
              timeout: 3000,
            };

            track.start();
            track.useHeadingEnabled = true; // rotates map to direction of travel
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            // view.when(() => {
            alert.open = true;
            track.stop();
            // });
            // showAlert("danger", "PERMISSION DENIED", "Please Try Again");
          }
        }
      );
    }

    // Main button
    go.addEventListener("click", () => {
      if (navigator.geolocation && go.value === "go") {
        requestLocation();
      } else {
        track.stop();
        alert.open = true;
      }
    });

    // Retry button in alert
    // enableLocationBtn.addEventListener("click", () => {
    //   requestLocation();
    //   // alert.open = false;
    // });
    // enableLocationBtn.addEventListener("click", () => {
    //   alert.open = false; // ✅ close alert immediately (no visual flicker)
    //   setTimeout(() => {
    //     // ✅ allow UI to close before requesting again
    //     requestLocation();
    //   }, 200);
    // });
  });
  //--------------------------------------------------------//

  // Show position on map
  async function showPosition(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    layer.visible = true;

    // Create point geom of user current location(graphic)
    const point = {
      type: "point",
      longitude: long,
      latitude: lat,
    };

    const markerSymbol = {
      type: "simple-marker",
      color: "dodgerblue", //"#0C2B4E",
      size: "15px",
      outline: {
        color: "white",
        width: 2,
        halo: "2px",
      },
    };

    const pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol,
      attributes: {
        Name: "Start Point",
      },
      popupTemplate: {
        title: "{Name}",
      },
    });

    view.graphics.add(pointGraphic);
    view
      .goTo({
        center: [long, lat],
        zoom: 13,
      })
      .catch((err) => console.wakrn("goTo interrupted:", err));

    const query = layer.createQuery();
    query.returnGeometry = true;
    query.outFields = ["*"];
    const result = await layer.queryFeatures(query);
    const facilities = result.features;
    if (facilities.length === 0) {
      showAlert("danger", "", "No hospital features found in the layer.");
      return;
    }
    //Find closest facility
    await findClosestHospital(point, facilities);
  }

  //------------- NEW ROUTE USING ROUTE LAYER ------------------------//

  async function findClosestHospital(point, facilities) {
    const loader = document.getElementById("routeLoader");
    loader.hidden = false;

    try {
      // 1) Determine the nearest hospital using Closest Facility
      const params = new ClosestFacilityParameters({
        incidents: new FeatureSet({
          features: [new Graphic({ geometry: point })],
        }),
        facilities: new FeatureSet({ features: facilities }),
        defaultTargetFacilityCount: 1,
        returnRoutes: true, // <-- IMPORTANT: must be true
        outSpatialReference: view.spatialReference,
      });

      const cfUrl =
        "https://route-api.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World";

      const cfResult = await closestFacility.solve(cfUrl, params);

      const returnedRoute = cfResult?.routes?.features?.[0];
      if (!returnedRoute) {
        console.warn("No closest-facility route returned.");
        return;
      }

      // FacilityID is 1-based index into the facilities you passed in
      const facilityIdx = Math.max(
        0,
        (returnedRoute.attributes?.FacilityID ?? 1) - 1
      );
      const nearest = facilities[facilityIdx];
      if (!nearest) {
        console.warn("Nearest facility not found in provided list.");
        return;
      }

      // 2) Build RouteLayer stops and solve/update RouteLayer
      routeLayer.stops = [
        { geometry: point, name: "Your Location" },
        {
          geometry: nearest.geometry,
          name: nearest.attributes?.hospital_nm || "Hospital",
        },
      ];

      await routeLayer.when();

      const solveResult = await routeLayer.solve({ apiKey: esriConfig.apiKey });
      routeLayer.update(solveResult);
      map.add(routeLayer);
      // 3) Zoom and open Directions panel
      const geom = solveResult?.routeInfo?.geometry;
      if (geom) {
        await view.goTo(geom.extent);
      }
      // if (typeof dirExpand !== "undefined" && dirExpand) {
      //   dirExpand.expand();
      // }
    } catch (err) {
      console.error("Closest facility failed:", err);
    } finally {
      loader.hidden = true; // always hide loader
    }
  }
});
