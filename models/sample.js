const middleMVP = require("../services/middle.service");

class Sample {

  static async middleInit(ctx) {
    try {
      const whatever = await middleMVP.axiosTest();
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async sampleFunction(ctx) {
    try {
      const text = "This is a sample test";
      ctx.body = text;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  
  static async sampleJson(ctx) {
    try {
      const json = {
        message: "This is a sample message",
        format: "json",
        users: [
            {
              id: 1658,
              name: 'test Name'
            },
            {
              id: 6578,
              name: 'some Name'
            },
            {
              id: 9823,
              name: 'the saying'
            },
            {
              id: 1572,
              name: 'api'
            }
          ]
        };
      ctx.body = json;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  static async function1(ctx) {
    try {
      const [results] = await global.db.query(`select * from users`);
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

module.exports = Sample;