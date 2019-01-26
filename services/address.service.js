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

}

module.exports = AddressService;