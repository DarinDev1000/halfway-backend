const axios = require('axios');
require('dotenv').config();

class Yelp {
    static async searchBusinessResult(latitude, longitude, term) {
        try {
            const urlResult = `${process.env.YELP_URL}/businesses/search?latitude=${latitude}&longitude=${longitude}&term=${term}`;
            const config = {
                headers: {
                    Authorization: `bearer ${process.env.YELP_API_KEY}`
                },
            };
            const res = await axios.get(urlResult, config);
            return res.data;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    static async searchBusinessResultPost(latitude, longitude, categories) {
        try {
            let radius = 2000;
            const catStr = categories.join(',');
            let res = {};
            do {
                console.log("loop");
                const urlResult = `${process.env.YELP_URL}/businesses/search?latitude=${latitude}&longitude=${longitude}&categories=${catStr}&radius=${radius}`;
                console.log('url-request', urlResult);
                const config = {
                headers: {
                        Authorization: `bearer ${process.env.YELP_API_KEY}`
                    },
                };
                res = await axios.get(urlResult, config);
                radius = radius * 2;
            } while (res.data.total < 2);

            return res.data;
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

module.exports = Yelp;