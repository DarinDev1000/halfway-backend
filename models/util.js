const randomstring = require('randomstring');
//const User = require('./user.js');
//const XLSX = require('xlsx');

class Util {

  static async sampleFunction(ctx) {
    try {
      const userID = ctx.params.userID;
      const [results] = await global.db.query(`update assetChanges 
                                         set submitted = 1
                                       where userID=:userID`, {
        userID: userID
      });
      ctx.body = results;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async function1(ctx) {
    try {
      const [results] = await global.db.query(`select * from table1`);
      ctx.body = results;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // static async function2(ctx, next) {
  //   ctx.state = {
  //     session: this.session,
  //     title: 'app'
  //   };

  //   await ctx.render('user', {
  //     user: 'John'
  //   });
  // });

  static async test(ctx) {
    await ctx.render('index.twig', {
      message: ctx.params.info
    });
  }

}



/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = Util;