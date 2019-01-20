const router = require('koa-router')(); // router middleware for koa
const dbcompare = require('../models/dbcompare');

router.get("/dbcompare/api", dbcompare.compareDatabasesAPI);
router.get("/dbcompare", dbcompare.compareDatabasesWebpage);



module.exports = router.middleware();
