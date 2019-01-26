const axios = require("axios");

require('dotenv').config(); // loads environment variables from .env file (if available - eg dev env)

class AddressService {

  static async addressToLatLong(address) {
    try {
      const address = '1600+Amphitheatre+Parkway,+Mountain+View,+CA';
      const responseLatLong = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},+CA&key=${process.env.GOOGLE_MAPS_API}`);
      return responseLatLong;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async geographCenter(lat1, long1, lat2, long2) {
    try {
        const midLat = (lat1 + lat2) / 2;
        const midLong = (long1 + long2) / 2;
        return {
          midLatitude: midLat,
          midLongitude: midLong
        };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

}

module.exports = AddressService;