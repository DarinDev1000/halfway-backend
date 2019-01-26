const yelpService = require('../services/yelp');

class YelpApi {
    static async getBusinessResult(ctx) {
        try {
            ctx.body = await yelpService.searchBusinessResult(
                ctx.params.lat, 
                ctx.params.long, 
                ctx.params.term
            );
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    static async getBusinessResultPost(ctx) {
        try {
            const latitude = ctx.request.body.latitude;
            const longitude = ctx.request.body.longitude;
            const terms = ctx.request.body.terms;
            console.log(terms);
            ctx.body = await yelpService.searchBusinessResultPost(
                latitude,
                longitude, 
                terms
            );
        } catch (e) {
            console.log(e);
            throw e;
        }

    }
}

module.exports = YelpApi;
