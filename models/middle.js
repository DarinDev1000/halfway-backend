const axios = require("axios");
const polyUtil = require('polyline-encoded');

// const Epoly = require('../services/epoly.service');

require('dotenv').config(); // loads environment variables from .env file (if available - eg dev env)

class middle {

    static async axiosTest(ctx) {
        // Function expects two addresses in json form like this:
        const DMKey = process.env.GOOGLE_MAPS_API;
        const myLocation = '5200 Lake Rd. Merced, California';
        const theirLocation = '4701 Stoddard Rd. Modesto, California';
    
        const map = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${myLocation}&destination=${theirLocation}&key=${DMKey}`);
        const DMresponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${myLocation}&destinations=${theirLocation}&key=${DMKey}`);
        
        const distance = DMresponse.data.rows[0].elements[0].distance.value; // Make sure the distance here matches real distances.
        const encoded = map.data.routes[0].overview_polyline;
        const decodedPoly = await polyUtil.decode(encoded);
        const decodeDeltas = await polyUtil.decodeDeltas(encoded);
        const decodeFloats = await polyUtil.decodeFloats(encoded);
        const decodeSignedIntegers = await polyUtil.decodeSignedIntegers(encoded);
        const decodeUnsignedIntegers = await polyUtil.decodeUnsignedIntegers(encoded);
        console.log(encoded);
        console.log(decodedPoly);
        console.log(decodeDeltas);
        console.log(decodeFloats);
        console.log(decodeSignedIntegers);
        console.log(decodeUnsignedIntegers);
        console.log(distance);
        //const polyline = polyUtil.decode(encoded);
        //console.log(polyline)
        //var test = poly.GetPointAtDistance(distance * 0.5)

        const encodedTest = "_p~iF~cn~U_ulLn{vA_mqNvxq`@";
        const latlngsTest = polyUtil.decode(encoded);
        console.log(encodedTest, latlngsTest);
    }
    
}

module.exports = middle