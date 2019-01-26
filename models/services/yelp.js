const axios = require('axios');
require('dotenv').config();

const baseUrl = process.env.YELP_URL;

class Yelp {
    static async searchBusinessResult(latitude, longitude, term) {
        const urlResult = `${baseUrl}/businesses/search`
        const config = {
            headers: {
                Authorization: `bearer ${process.env.YELP_API_KEY}`
            },
            // auth: {
            //     "bearer": process.env.YELP_API_KEY
            // },
            latitude: latitude,
            longitude: longitude,
            term: term
        }

        const res = await axios.get(urlResult, config)
        console.log(res.data);
        return res.data;
    }
}

module.exports = Yelp;