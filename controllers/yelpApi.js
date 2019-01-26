const yelpService = require('../services/yelp');

class YelpApi {
    static async getBusinessResult(ctx) {
        try {
            ctx.body = await yelpService.searchBusinessResult(
                ctx.params.lat, 
                ctx.params.long, 
                ctx.params.term
            )            
        } catch (e) {
            console.log(e);
            throw e;
        }

    }
}

module.exports = YelpApi;