const axios = require('axios');
require('dotenv').config();

const baseUrl = process.env.YELP_URL;

class Yelp {
    static async searchBusinessResult(latitude, longitude, term) {
        const urlResult = `${baseUrl}/businesses/search`;
        // const config = {

        //     headers: {
        //         Authorization: `Bearer {process.env.YELP_API_KEY}`
        //     }
        // };

        const config = {
        headers: {
                Authorization: `Bearer {process.env.YELP_API_KEY}`
            }
        };

        const data = {
            'HTTP_CONTENT_LANGUAGE': 'self.language'
        };

        // headers: {
            //     Authorization: `bearer ${process.env.YELP_API_KEY}`
            // },
            // auth: {
            //     "bearer": process.env.YELP_API_KEY
            // },
            // latitude: latitude,
            // longitude: longitude,
            // term: term

        console.log(urlResult);

        const res = await axios.get('https://api.yelp.com/v3/businesses/search?latitude=37.05165465&longitude=-120.5489415&term=coffee&radius=10000', {
            headers: {
                Authorization: `Bearer {process.env.YELP_API_KEY}`
            }
        });


        // const res = await axios.get(urlResult, data, config);
        // console.log(res.data);
        return res;
    }
}

module.exports = Yelp;