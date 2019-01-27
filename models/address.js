// const AddressService = require('AddressService');

const axios = require("axios");

const AddressService = require('../services/address.service');
const YelpService = require('../services/yelp.service');
const middle = require('./middle');

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

  static async getGeographicCenter(ctx) {
    try {
      const myAddress = ctx.request.body.myAddress;
      const myZip = ctx.request.body.myZip;
      const theirAddress = ctx.request.body.theirAddress;
      const theirZip = ctx.request.body.theirZip;

      const myRequestURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${myAddress}+${myZip}&key=${process.env.GOOGLE_MAPS_API}`;
      const theirRequestURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${theirAddress}+${theirZip}&key=${process.env.GOOGLE_MAPS_API}`;
      const myResults = await axios.get(myRequestURL);
      const theirResults = await axios.get(theirRequestURL);
      const myLatLong = myResults.data.results[0].geometry.location;
      const theirLatLong = theirResults.data.results[0].geometry.location;

      console.log(myLatLong);
      console.log(theirLatLong);

      const geographicCenter = await AddressService.geographCenter(myLatLong.lat, myLatLong.lng, theirLatLong.lat, theirLatLong.lng);

      console.log('geographic center point:  ', geographicCenter);

      // Filter locations
      let categories = [];
      if (ctx.request.body.categories) {
        categories = ctx.request.body.categories;
      } 

      const filteredLocations = await YelpService.searchBusinessResultPost(geographicCenter.midLatitude, geographicCenter.midLongitude, categories);
      console.log(filteredLocations.businesses[0]);
      

      ctx.body = filteredLocations.businesses[0];
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async getRouteCenter(ctx) {
    try {
      const myAddress = ctx.request.body.myAddress;
      const myZip = ctx.request.body.myZip;
      const theirAddress = ctx.request.body.theirAddress;
      const theirZip = ctx.request.body.theirZip;

      const myRequestURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${myAddress}+${myZip}&key=${process.env.GOOGLE_MAPS_API}`;
      const theirRequestURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${theirAddress}+${theirZip}&key=${process.env.GOOGLE_MAPS_API}`;
      const myResults = await axios.get(myRequestURL);
      const theirResults = await axios.get(theirRequestURL);
      const myLatLong = myResults.data.results[0].geometry.location;
      const theirLatLong = theirResults.data.results[0].geometry.location;

      console.log(myLatLong);
      console.log(theirLatLong);

      console.log('parameters', `${myAddress} ${myZip}`, `${theirAddress} ${theirZip}`);

      const routeMiddle = await middle.getRouteMiddle(ctx, `${myAddress} ${myZip}`, `${theirAddress} ${theirZip}`);

      console.log('route center point:  ', routeMiddle);

      // Filter locations
      let categories = [];
      if (ctx.request.body.categories) {
        categories = ctx.request.body.categories;
      }
      console.log(routeMiddle.midLatitude); 
      const filteredLocations = await YelpService.searchBusinessResultPost(routeMiddle.midLatitude, routeMiddle.midLongitude, categories);

      // console.log(filteredLocations.businesses[0]);
      

      ctx.body = filteredLocations.businesses[0];
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = Address;