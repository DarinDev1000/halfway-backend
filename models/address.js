// const AddressService = require('AddressService');

const axios = require("axios");

class Address {

  static async submitAddress(ctx) {
    try {
      let address = '1600+Amphitheatre+Parkway,+Mountain+View,+CA';
      if (ctx.request.body.address) {
        address = ctx.request.body.address;
      } 
      console.log('address', address);
      const requestURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API}`;
      console.log(requestURL);
      // const responseLatLong = await axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA,+CA&key=AIzaSyDTR1tSdwSPeBMEPc_pmhDvTyzNstDly8g');
      const responseLatLong = await axios.get(requestURL);
        // .then( (res) => data = res )
      
      const [results1] = responseLatLong.data.results;
      const geometry = results1.geometry;
      // console.log(geometry.location);
      
      ctx.body = geometry.location;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = Address;