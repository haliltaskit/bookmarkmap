GetAllData();

async function GetAllData() {
  const response = await fetch("/api");
  const data = await response.json();
  const table = document.querySelector("#table");
  for (item of data) {
    const root = document.createElement("tr");
    const lat = document.createElement("td");
    const lon = document.createElement("td");
    const date = document.createElement("td");
    const weather = document.createElement("td");
    const temperature = document.createElement("td");
    const location = document.createElement("td");
    const bookmarkCount = document.createElement("td");
    //Server Time
    // const dateString = new Date(item.timestamp).toLocaleString();
    const dateString=item.localtime;
    lat.textContent = item.lat;
    lon.textContent = item.lon;
    weather.textContent = item.temperature_summary;
    temperature.textContent = item.temperature;
    location.textContent = item.location;
    bookmarkCount.textContent = item.markers.length;
    date.textContent = dateString;
    root.append(date, location, lat, lon, temperature, weather, bookmarkCount);
    table.appendChild(root);
  }
  console.log(data);
}
