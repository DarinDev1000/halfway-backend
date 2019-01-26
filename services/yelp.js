const axios = require('axios');
require('dotenv').config();

class Yelp {
    static async searchBusinessResult(latitude, longitude, term) {
        const urlResult = `${process.env.YELP_URL}/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${term}`;
        const config = {
            headers: {
                Authorization: `bearer ${process.env.YELP_API_KEY}`
            },
        };
        const res = await axios.get(urlResult, config);
        return res.data;
    }

    static async searchBusinessResultPost(latitude, longitude, term) {
        let terms = "";
        for (const t of term) {
            terms = `${terms}&term=${t}`;
        }
        console.log(terms);
        const urlResult = `${process.env.YELP_URL}/businesses/search?latitude=${latitude}&longitude=${longitude}${terms}`;
        console.log(urlResult);
        const config = {
            headers: {
                Authorization: `bearer ${process.env.YELP_API_KEY}`
            },
        };
        const res = await axios.get(urlResult, config);
        return res.data;
    }
}

module.exports = Yelp;