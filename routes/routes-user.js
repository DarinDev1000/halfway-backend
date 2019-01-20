/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  User routes                                                                                  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

const router = require('koa-router')(); // router middleware for koa
const user = require('../models/user.js');

router.get('/user/new', user.sendNew);

router.get('/user/getalladmin', user.getAllAdmin); // get all users
router.get('/user/getroles', user.getRoles); // get all user roles
router.get('/user/locations', user.getLocation); // get all user roles
router.post('/user', user.register); //
router.delete('/user/:userID', user.deleteUser); // delete a user
router.put('/user/password', user.updatePassword); // Update current user password.
router.put('/user/:userID', user.save); // update a user
router.put('/user/video/:videoID', user.watchedVideo); // update a user to mark a video as watched
router.get('/user/videos', user.getVideos); // Get a list of unwatched videos for the current user.
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = router.middleware();
