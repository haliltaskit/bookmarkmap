const express = require("express");
const dataStore = require("nedb");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.port || 5500;
app.listen(PORT, () => console.log(`listening at ${PORT}`));
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const database = new dataStore("database.db");
database.loadDatabase();

app.get("/api", (req, res, next) => {
  database
    .find({})
    .sort({ timestamp: -1 })
    .exec((err, data) => {
      if (err) {
        res.end();
        return;
      }
      res.json(data);
    });
});

app.post("/api", async (request, response) => {
  const data = request.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;
  const ip = await fetch("https://ipapi.co/json");
  data.userDetails = await ip.json();
  database.insert(data);
  response.json(data);
  console.log(
    `Lat : ${data.lat} , Lon: ${data.lon} , Time : ${new Date(
      data.timestamp
    ).toLocaleString()}`
  );
});

app.get("/weather/:latlon", async (req, res) => {
  const requestData = req.params.latlon.split(",");
  const lat = requestData[0];
  const lon = requestData[1];
  console.log(lat, lon);
  const api_key = process.env.WEATHER_API_KEY;
  const api_Url = `https://api.darksky.net/forecast/${api_key}/${lat},${lon}?units=si`;
  const fetch_response = await fetch(api_Url);
  const json = await fetch_response.json();
  res.send(json);
});

app.get("/markers", (req, res, next) => {
  database.find({ markers: { $exists: true } }).exec((err, data) => {
    if (err) {
      res.end();
      return;
    }
    res.json(data);
  });
});

app.get("/geocode/:latlon", async (req, res) => {
  const requestData = req.params.latlon.split(",");
  const lat = requestData[0];
  const lon = requestData[1];
  const app_id = process.env.GEOCODE_APP_ID;
  const app_code = process.env.APP_CODE;
  const api_Url = `https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=${lat},${lon}&mode=retrieveAddresses&maxresults=1&gen=9&app_id=${app_id}&app_code=${app_code}`;
  const fetch_response = await fetch(api_Url);
  const json = await fetch_response.json();
  res.send(json);
});

app.get("/airquality/:latlon", async (req, res) => {
  const requestData = req.params.latlon.split(",");
  const lat = requestData[0];
  const lon = requestData[1];
  const api_Url = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
  const fetch_response = await fetch(api_Url);
  const json = await fetch_response.json();
  res.send(json);
});

app.get("/time/:timezone", async (req, res) => {
  const requestData = req.params.timezone.split(",");
  const region = requestData[0];
  const country = requestData[1];
  const api_Url = `http://worldtimeapi.org/api/timezone/${region}/${country}`;
  const fetch_response = await fetch(api_Url);
  const json = await fetch_response.json();
  res.send(json);
});
