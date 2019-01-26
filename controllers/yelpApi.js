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

    /* @param
      latitude is number
      longitude is number
      categories is array of string
    */
    static async getBusinessResultPost(ctx) {
        try {
            const latitude = ctx.request.body.latitude;
            const longitude = ctx.request.body.longitude;
            const categories = ctx.request.body.categories;

            ctx.body = await yelpService.searchBusinessResultPost(
                latitude,
                longitude, 
                categories
            );
        } catch (e) {
            console.log(e);
            throw e;
        }

    }
}

module.exports = YelpApi;
