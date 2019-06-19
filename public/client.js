let lat, lon, weather, apiDatas, map, geocode, localTime, airQuality, markerLayer;
let bookmarkPoint = [];
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(async position => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    document.getElementById("latitude").textContent = lat.toFixed(2);
    document.getElementById("longitude").textContent = lon.toFixed(2);

    // Weather API Call
    const weather_api_Url = `weather/${lat},${lon}`;
    const responseWeather = await fetch(weather_api_Url);
    weather = await responseWeather.json();
    console.log(weather);
    const timezone = weather.timezone.split('/');
    const region = timezone[0];
    const country = timezone[1];
    // Time API Call

    const time_api_Url = await `time/${region},${country}`;
    const responseTime = await fetch(time_api_Url);
    const rawLocalTime = await responseTime.json();
    localTime = await rawLocalTime.datetime.split("T")[1].split(".")[0];

    // Geocode API Call
    const geocode_api_Url = `geocode/${lat},${lon}`;
    const responseGeocode = await fetch(geocode_api_Url);
    geocode = await responseGeocode.json();
    // Air Quality API Call
    const airquality_api_Url = `airquality/${lat},${lon}`;
    const responseAirQuality = await fetch(airquality_api_Url);
    airQuality = await responseAirQuality.json();

    apiDatas = {
      weather_summary: weather.currently.summary,
      temperature: weather.currently.apparentTemperature,
      geocode_location:
        geocode.Response.View[0].Result[0].Location.Address.Label,
      local_time: localTime
    };
    await GetMap();
    await GetMarker(lat, lon);
    await GetAllMarkers();
    await AddMarkerEvent();
    await MarkerAndPopup();

    document.getElementById("weather_summary").textContent =
      apiDatas.weather_summary;
    document.getElementById("temperature").textContent =
      apiDatas.temperature + " ºC";
    document.getElementById("geocode_location").textContent =
      apiDatas.geocode_location;
    document.getElementById("local_time").textContent =
      apiDatas.local_time;

    console.log(apiDatas);

    try {
      const airResults = airQuality.results[0].measurements;
      document.getElementById("aq_parameter").textContent =
        airResults[0].parameter;
      document.getElementById("aq_value").textContent = airResults[0].value;
      document.getElementById(
        "aq_date"
      ).textContent = airResults[0].lastUpdated.split("T")[0];
      document.getElementById("aq_unit").textContent = airResults[0].unit;
    } catch (err) {
      document.getElementById("aQ_paragraph").hidden = true;
    }
  });
} else {
  console.log("geolocation not available");
}

async function GetMap() {
  map = await new maptalks.Map("map", {
    center: [parseFloat(lon), parseFloat(lat)],
    zoom: 15,
    baseLayer: new maptalks.TileLayer("base", {
      urlTemplate: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      attribution:
        '&copy; <a href="http://www.osm.org/copyright">OSM</a> contributors, ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    })
  });
}

async function GetMarker(lat, lon) {
  marker = await new maptalks.Marker([parseFloat(lon), parseFloat(lat)], {
    visible: true,
    editable: false,
    cursor: "pointer",
    shadowBlur: 0,
    shadowColor: "black",
    draggable: false,
    dragShadow: false, // display a shadow during dragging
    drawOnAxis: null // force dragging stick on a axis, can be: x, y
  });
  marker.updateSymbol({
    markerFill: "#0e595e"
  });
  markerLayer = new maptalks.VectorLayer("markers").addTo(map);
}

async function MarkerAndPopup() {
  await new maptalks.VectorLayer("vector", marker).addTo(map);
  marker.setInfoWindow({
    title: "User",
    content: `Adress : ${apiDatas.geocode_location} <br /> Temperature : ${
      apiDatas.temperature
      } ºC`
  });
  marker.openInfoWindow();
}

function AddMarkerEvent() {
  map.on("click", function (e) {
    var marker = new maptalks.Marker(e.coordinate);
    marker.updateSymbol({
      markerFill: "#ADE9A7"
    });
    marker.addTo(markerLayer);
    console.log(marker);
    bookmarkPoint.push(marker._coordinates);
    console.log(bookmarkPoint);
  });
}

const submitButton = document.getElementById("submit");
submitButton.addEventListener("click", async event => {
  const temperature_summary = weather.currently.summary;
  const temperature = weather.currently.apparentTemperature + " ºC";
  const location = geocode.Response.View[0].Result[0].Location.Address.Label;
  const markers = bookmarkPoint;
  const localtime = localTime;
  const data = {
    lat,
    lon,
    temperature_summary,
    temperature,
    location,
    markers,
    localtime
  };
  console.log(data.localtime);
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
  const response = await fetch("/api", options);
  const json = await response.json();
  console.log(json);
});

async function GetAllMarkers() {
  const response = await fetch("/markers");
  const json = await response.json();
  var markerLayer = await new maptalks.VectorLayer("savedMarkers").addTo(map);
  json.forEach(element => {
    let i = element.markers.length;
    do {
      if (element.markers[i] != undefined) {
        // const x = element.markers[i].x;
        // const y = element.markers[i].y;
        var marker = new maptalks.Marker(element.markers[i]);
        marker.addTo(markerLayer);
      }
      i--;
    } while (i > -1);
  });
}
