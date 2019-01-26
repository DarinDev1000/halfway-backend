/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Route to handle root element: return uri's for available resources & note on authentication   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

const router = require('koa-router')(); // router middleware for koa
const sample = require('../models/sample');
const middle = require('../models/middle');
const yelp = require('../controllers/yelpApi');

router.get('/', sample.sampleFunction);
router.get('/json', sample.sampleJson);
router.get('/middle', middle.axiosTest);



router.get('/yelpData/:lat/:long/:term', yelp.getBusinessResult);
router.post('/yelpData', yelp.getBusinessResultPost);
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = router.middleware();
