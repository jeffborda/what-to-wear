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
        search_query: request.query.location, /* may not need all properties of this object (MUST have lat/long)  */
        formatted_query: result.body.results[0].formatted_address,
        latitude: result.body.results[0].geometry.location.lat,
        longitude: result.body.results[0].geometry.location.lng,
      }

      console.log('location object:: ', location);

      const weather_url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${location.latitude},${location.longitude}`;
      return superagent.get(weather_url)
        .then(result => {
          console.log('LATITUDE of RESULT:: ',result.body.latitude);
          console.log('LONGITUDE of RESULT:: ',result.body.longitude);
          response.render('pages/detail', {summary: result.body.currently.dewPoint});
        })
        .catch(error => {
          response.render('pages/error', {errorMessage: error});
        })

    })
    .catch(error => {
      response.render('pages/error', {errorMessage: error});
    })

}

// function handleError(error, response) {
//   console.log('ERROR: ', error);
//   if(response) {
//     return response.status(500).send('Sorry, something went wrong.')
//   }
// }



// :::::::::: MAIN :::::::::: //

app.get('*', (request, response) => response.status(404).send('This route does not exist'));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
