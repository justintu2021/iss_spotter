/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};



const fetchCoordsByIP = (ip,callback) => {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching Coordinates for IP: ${body}`), null);
      return;
    }

    const latitude = JSON.parse(body).latitude;
    const longitude = JSON.parse(body).longitude;
    const latANDlong = {"latitude": latitude, "longitude": longitude }
    // const { latitude, longitude } = JSON.parse(body);
    callback(null, latANDlong);
  });
};


const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);
  });
};


const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP ((error,ip) => {
    if (error) {
      console.log("It didn't work!" , error)
      return;
    }
    console.log('It worked! Returned IP:' , ip);
    
    fetchCoordsByIP(ip,(error, coordinates) => {
      if (error) {
        console.log("It didn't work!" , error);
        return;
      }
      console.log('It worked! Returned coordinates:' , coordinates);
      
      fetchISSFlyOverTimes(coordinates,(error, passTimes) => {
        if (error) {
          console.log("It didn't work!" , error);
          return;
        }
        callback(null, passTimes)
      })
    })
  })
}



module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };