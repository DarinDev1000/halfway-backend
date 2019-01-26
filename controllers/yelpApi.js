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

<<<<<<< HEAD
    /* @param
      latitude is number
      longitude is number
      categories is array of string
    */
=======
>>>>>>> 543143dc61faca8a0d354c608348a8d093c135e1
    static async getBusinessResultPost(ctx) {
        try {
            const latitude = ctx.request.body.latitude;
            const longitude = ctx.request.body.longitude;
<<<<<<< HEAD
            const categories = ctx.request.body.categories;

            ctx.body = await yelpService.searchBusinessResultPost(
                latitude,
                longitude, 
                categories
=======
            const terms = ctx.request.body.terms;
            console.log(terms);
            ctx.body = await yelpService.searchBusinessResultPost(
                latitude,
                longitude, 
                terms
>>>>>>> 543143dc61faca8a0d354c608348a8d093c135e1
            );
        } catch (e) {
            console.log(e);
            throw e;
        }

    }
}

module.exports = YelpApi;
