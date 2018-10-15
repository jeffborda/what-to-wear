'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended: true}));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// API Routes
app.get('/', (request, response) => response.render('pages/index'));
app.get('/getWeather', getWeather);




// Helper Functions
function getWeather(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.location}&key=${process.env.GOOGLE_API_KEY}`;

  superagent.get(url)
    .then(result => {
      const location = {
        /* may not need all properties of this object (but MUST have lat/long)  */
        search_query: request.query.location,
        formatted_query: result.body.results[0].formatted_address,
        latitude: result.body.results[0].geometry.location.lat,
        longitude: result.body.results[0].geometry.location.lng,
      }

      const weather_url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${location.latitude},${location.longitude},${Math.floor(Date.now()/1000)}?exclude=minutely,hourly,flags`;

      return superagent.get(weather_url)
        .then(result => {
          // console.log('LATITUDE of RESULT:: ', result.body.latitude);
          // console.log('LONGITUDE of RESULT:: ', result.body.longitude);
          // console.log('TIME of RESULT:: ', result.body.currently.time);


          const weatherData = new WeatherSummary(result);
          //
          console.log(weatherData);


          // response.render('pages/detail', {myWeather: weatherData}); //Can use this to send over all weather data if necessary
          // response.render('pages/detail', {summary: result.body.daily.data[0].summary}); //TEMP: prints Wx summary
          response.render('pages/detail', {summary: result.body.daily.data[0].summary, display: findClothing(weatherData)}); //TEMP: prints Wx summary
        })
        .catch(error => {
          response.render('pages/error', {errorMessage: error});
        })

    })
    .catch(error => {
      response.render('pages/error', {errorMessage: error});
    })

}

function findClothing(weather) {

  let clothing = {
    cap: true,
    snowCap: false,
    hoodie: false,
    rainCoat: false,
    lightJacket: false,
    winterJacket: false,
    longTee: true,
    shortTee: false,
    pants: true,
    shorts: false,
    shoes: true,
    rainBoots: false,
    umbrella: false,
    sunglasses: false,
  }

  // Hats
  if(weather.maxApparantTemperature < 40) {
    clothing.cap = false;
    clothing.snowCap = true;
  }

  // Jackets
  if(weather.minApparantTemperature <= 35) {
    clothing.winterJacket = true;
  }
  if(weather.precipProbability > 0.2 && weather.minApparantTemperature > 35) {
    clothing.rainCoat = true;
  }
  if(weather.maxApparantTemperature < 70 && weather.minApparantTemperature > 35 && weather.precipitationProbability <= 0.2) {
    clothing.hoodie = true;
    clothing.lightJacket = true;
  }

  // Shirts
  if(weather.maxApparantTemperature > 70) {
    clothing.longTee = false;
    clothing.shortTee = true;
  }

  // Pants
  if(weather.maxApparantTemperature > 75 && weather.precipitationProbability < 0.8) {
    clothing.pants = false;
    clothing.shorts = true;
  }

  // Shoes
  if(weather.precipitationProbability > 0.8) {
    clothing.shoes = false;
    clothing.rainBoots = true;
  }

  // Accessories
  if(weather.cloudCover < 0.1) {
    clothing.sunglasses = true;
  }
  if(weather.precipitationProbability > 0.7 && weather.precipitationType === 'rain') {
    clothing.umbrella = true;
  }


  return clothing;
}



// function handleError(error, response) {
//   console.log('ERROR: ', error);
//   if(response) {
//     return response.status(500).send('Sorry, something went wrong.')
//   }
// }


// CONSTRUCTORS
function WeatherSummary(result) {
  this.icon = result.body.daily.data[0].icon; //string
  this.summary = result.body.currently.summary; //string
  this.dailySummary = result.body.daily.data[0].summary; //string
  this.precipitationProbability = result.body.currently.precipProbability;
  this.precipitationIntensity = result.body.currently.precipIntensity;
  this.currentTemperature = result.body.currently.temperature;
  this.precipitationType = result.body.daily.data[0].precipType;
  this.maxTemperature = result.body.daily.data[0].temperatureHigh;
  this.maxApparantTemperature = result.body.daily.data[0].apparentTemperatureMax;
  this.minTemperature = result.body.daily.data[0].temperatureLow;
  this.minApparantTemperature = result.body.daily.data[0].apparentTemperatureMin;
  this.cloudCover = result.body.daily.data[0].cloudCover;
}



// :::::::::: MAIN :::::::::: //

app.get('*', (request, response) => response.status(404).send('This route does not exist'));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
