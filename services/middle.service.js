
const axios = require("axios");


function axiosTest() {
    // Function expects two addresses in json form like this:
    const DMKey = 'AIzaSyDTR1tSdwSPeBMEPc_pmhDvTyzNstDly8g';

    // const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${myLocation}&destinations=${theirLocation}&mode=driving&key=${DMKey}`);

    const address1 = makeAddJSON("4701 Stoddard Rd", "Modesto", "CA", "95356");
    const address2 = makeAddJSON("5200 Lake Rd", "Merced", "CA", "95340");
}


function makeAddJSON(street, city, state, zipcode) {
    return ({
        street : street,
        city : city,
        state : state,
        zipcode : zipcode
    });
}

// IN: Address JSON
// OUT: Midpoint
function middleA(address1, address2) {

}

// IN: LatLon JSON
// OUT: Midpoint
function middleL(){
    const directionsService = new google.maps.DirectionsService();
}

