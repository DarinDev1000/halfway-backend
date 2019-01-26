const epoly = require("../services/epoly.service");
const axios = require('axios');
const polyline = require('google-polyline')

class middle {

    static async axiosTest(ctx) {
        // Function expects two addresses in json form like this:
        const DMKey = process.env.GOOGLE_MAPS_API;
        const myLocation = '5200 Lake Rd. Merced, California';
        const theirLocation = '4701 Stoddard Rd. Modesto, California';
    
        const map = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${myLocation}&destination=${theirLocation}&key=${DMKey}`);
        const DMresponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${myLocation}&destinations=${theirLocation}&key=${DMKey}`);
        //
        const distance = DMresponse.data.rows[0].elements[0].distance.value; // Make sure the distance here matches real distances.
        const encoded = map.data.routes[0].overview_polyline.points;
        const decoded = polyline.decode(encoded)
        console.log(decoded)

        const test = poly.GetPointAtDistance(distance * 0.5)
        
    }

    
}

module.exports = middle