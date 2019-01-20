/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Route to handle authentication /auth element                                                  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

const router = require('koa-router')(); // router middleware for koa
//const user = require('../models/user.js');

/**
 * @api {get} /auth Get JWT authentication token for subsequent API requests
 * @apiName   GetAuth
 * @apiGroup  Auth
 *
 * @apiDescription Subsequent requests requiring authentication are made with the JSON Web Token
 *   obtained from /auth, supplied in the Bearer Authorization HTTP header.
 *
 *   Note that since this does a KDF verification, it is a *slow* operation. The returned token has a
 *   24-hour limited lifetime.
 *
 * @apiParam   username                  Email of user to be authenticated.
 * @apiParam   password                  Password of user to be authenticated.
 * @apiHeader  [Accept=application/json] application/json, application/xml, text/yaml, text/plain.
 * @apiSuccess jwt                       JSON Web Token be used for subsequent Authorization header
 */

// router.post('/auth', user.getAuth);
// router.get('/user/code/:code', user.validateCode); // Validate a JWT
// router.post('/user/register', user.register);
// router.get('/roles', user.getRoles);
// router.put('/reset/', user.getResetEmail);
// router.post('/reset/:resetCode', user.resetEmail);
// router.get('/reset/:resetCode/validate', user.resetValidate);


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = router.middleware();
