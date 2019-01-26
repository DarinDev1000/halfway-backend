const epoly = require("../services/epoly.service");
const axios = require('axios');
const polyline = require('google-polyline');

class middle {

    static async axiosTest(ctx) {
        // Function expects two addresses in json form like this:
        const DMKey = process.env.GOOGLE_MAPS_API;
        const myLocation = '5200 Lake Rd. Merced, California';
        const theirLocation = '4701 Stoddard Rd. Modesto, California';
    
        const map = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${myLocation}&destination=${theirLocation}&key=${DMKey}`);
        const DMresponse = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${myLocation}&destinations=${theirLocation}&key=${DMKey}`);
        //
        const distance = (DMresponse.data.rows[0].elements[0].distance.value) / 1000; // Make sure the distance here matches real distances.
        const encoded = map.data.routes[0].overview_polyline.points;
        const decoded = polyline.decode(encoded)
        // console.log(decoded);

        // const test = poly.GetPointAtDistance(distance * 0.5)
        const middleLocation = await middle.calculateMiddle(ctx, distance, decoded);

        ctx.body = middleLocation;
    }

    static async calculateMiddle(ctx, distance, decoded) {
        // console.log('distance', distance);
        let mDistance = 0;
        let index = 0;
        let shortDistance = 0;
        let latLongDiff = 0;
        while ( mDistance <= distance / 2 ) {
            // console.log(decoded[0][0], decoded[0][1]);
            // this.latLongDiff = [ Math.abs( decoded[index][0] - decoded[index + 1][0]), Math.abs( decoded[index][1] - decoded[index + 1][1]) ];
            // console.log(decoded[index][0], decoded[index][1], decoded[index + 1][0], decoded[index + 1][1]);
            const latLongDiff = await middle.getDistanceFromLatLonInKm(decoded[index][0], decoded[index][1], decoded[index + 1][0], decoded[index + 1][1]);
            // console.log(latLongDiff);

            mDistance += latLongDiff;
            // console.log(mDistance);
            index++;
        }
        console.log(decoded[index][0], decoded[index][1]);

        // const test = await middle.approxLatLongDistance( 37.36587, -120.42483, 37.3659, -120.42506);
        const test = await middle.getDistanceFromLatLonInKm( 37.36587, -120.42483, 37.3659, -120.42506);
        return test;
    }

    static async latLongDistance(lat1, lon1, lat2, lon2) {
        var R = 6371e3; // metres
        var φ1 = lat1.toRadians();
        var φ2 = lat2.toRadians();
        var Δφ = (lat2-lat1).toRadians();
        var Δλ = (lon2-lon1).toRadians();

        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var d = R * c;
    }

    static async approxLatLongDistance(lat1, lon1, lat2, lon2) {
        var R = 6371e3;
        var x = (lat2-lat1) * Math.cos((lon1+lon2)/2);
        var y = (lon2-lon1);
        var d = Math.sqrt(x*x + y*y) * R;
        return d;
    }

    static async getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = await middle.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = await middle.deg2rad(lon2-lon1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(await middle.deg2rad(lat1)) * Math.cos(await middle.deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
      }
      
      static async deg2rad(deg) {
        return deg * (Math.PI/180);
      }
    
}

module.exports = middle;