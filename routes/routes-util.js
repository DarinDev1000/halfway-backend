const router = require('koa-router')(); // router middleware for koa
const util = require('../models/util');

// router.get('/myassets', util.getMyAssets); // Gets all assets that are uncommited for the current user
// router.post('/myassets', util.addMyAsset); // Adds a new uncommitted asset to the current user
// router.put('/myassets/:assetID', util.updateMyAsset); // Updates the identified asset that belongs to the current user
// router.delete('/myassets/:assetID', util.deleteMyAsset); // Deletes the identified asset that belongs to the current user
// router.put('/commitmyassets', util.commitMyAssets); // Takes all of the users assets and sets them as submitted.

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

router.get("/test/:info*", util.test);


module.exports = router.middleware();
