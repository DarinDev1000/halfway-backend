const axios = require("axios");
const polyUtil = require('polyline-encoded');

class middle {

    static async axiosTest() {
        // Function expects two addresses in json form like this:
        const DMKey = 'AIzaSyDTR1tSdwSPeBMEPc_pmhDvTyzNstDly8g';
        const myLocation = '5200 Lake Rd. Merced, California';
        const theirLocation = '4701 Stoddard Rd. Modesto, California';
    
        const map = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${myLocation}&destination=${theirLocation}&key=${DMKey}`);
        const DMresponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${myLocation}&destinations=${theirLocation}&key=${DMKey}`);

        const encodedPoly = map.data.routes[0].overview_polyline;
        const decodedPoly =  await polyUtil.decode(encoded);
        const distance = DMresponse.data.rows[0].elements[0].distance.value;
        console.log(decodedPoly);
        //var test = poly.GetPointAtDistance(distance * 0.5)
    }
    
}

module.exports = middle