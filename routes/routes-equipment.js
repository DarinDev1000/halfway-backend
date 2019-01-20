const router = require('koa-router')(); // router middleware for koa
const equipment = require('../models/equipment');

router.get('/location/:id/equipment', equipment.getLocation);
router.get('/asset/:id', equipment.getAsset);
router.get('/equipment/:id/fields', equipment.getEquipmentFields);
router.post('/location/:id/asset', equipment.addToLocation);
router.put('/asset/:id/move', equipment.updateAssetStatus);

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = router.middleware();
