/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* User model; users allowed to access the system                                                 */
/*                                                                                                */
/* All database modifications go through the model; most querying is in the handlers.             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

const Lib = require('../lib/lib.js');
const ModelError = require('./modelerror.js');
//const scrypt = require('scrypt'); // scrypt library
const moment = require('moment');
const jwt = require('jsonwebtoken'); // JSON Web Token implementation
const randomstring = require('randomstring');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN
});
const MailComposer = require('nodemailer/lib/mail-composer');
const video = require('./video');

class User {

  static async sendNew(ctx) {
    // This will generate a random string of 5 characters for a password and then add it to the user and send the password and login info to the user where the user does not have a password

    const [users] = await global.db.query(
      `SELECT *
       FROM user
       WHERE password = ''`
    );

    const out = [];

    for (const u of users) {

      const password = randomstring.generate(5);

      let newPassword = '';
      while (newPassword.length < 10) {
        newPassword = scrypt.kdfSync(password, {
          N: 16,
          r: 8,
          p: 2,
        });
      }

      await global.db.query(`update user set password = :password where id = :id`, {
        password: newPassword,
        id: u.id
      });

      const mailOptions = {
        from: `noreply@mg.assets.familyradio.org`,
        to: u.email,
        subject: `Family Radio Assets - New Account`,
        text: `An account has been created for you at assets.familyradio.org.  
               Your Email for the site is ${u.email} and your password is ${password}
               You can log in at ${process.env.DOMAIN}, once you do you will be required to enter a new password.`,
        html: `An account has been created for you at assets.familyradio.org. <br> 
               <ul>
                 <li>Your Email for the site is ${u.email}</li>
                 <li>Your password is ${password}</li>
                 <li>You can log in at ${process.env.DOMAIN}</li>
                 <li>Once you log in you will be required to enter a new password.</li>
               </ul>`
      };


      const result = await User.sendUserEmail(ctx.request.body.email, mailOptions);

      out.push({
        email: u.email,
        result: result
      });

    }
    ctx.body = out;
  }

  static async getAuth(ctx) {

    if (!ctx.request.body.refreshToken && !ctx.request.body.email) {
      ctx.request.body = JSON.parse(ctx.request.body);
    }


    let user = null;
    if (ctx.request.body.refreshToken) {
      [user] = await User.getByToken(ctx.request.body.refreshToken);
      if (!user) {
        [user] = await User.getBy('refreshToken', ctx.request.body.refreshToken);
        if (!user) ctx.throw(401, 'Bad Token not found');
      }
    } else {
      [user] = await User.getBy('email', ctx.request.body.email);

      if (!user) ctx.throw(401, 'Username/password not found');

      try {
        const match = await scrypt.verifyKdf(
          Buffer.from(user.password, 'base64'),
          ctx.request.body.password
        );

        if (!match) ctx.throw(401, 'Username/password not found.');
      } catch (e) {
        // e.g. "data is not a valid scrypt-encrypted block"
        //ctx.throw(404, e.message);
        ctx.throw(401, 'Username/password not found!');
      }
    }

    try {

      const payload = {
        id: user.id, // to get user details
        role: user.role, // make role available without db query
        dcomAsset: user.dcomAsset,
        dcomLoc: user.dcomLoc,
        updateAsset: user.updateAsset,
        forcePassword: user.forcePassword
      };

      const token = jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: process.env.TOKEN_TIME,
      });
      const refreshToken = randomstring.generate(50);
      const decoded = jwt.verify(token, process.env.JWT_KEY); // throws on invalid token
      const ret = User.addToken(user.id, refreshToken);

      let videos = [];
      if (user.id) {
        videos = await video.getUserVideos(user.id, user.role);
      }

      const result = {
        jwt: token,
        role: user.role,
        fname: user.fname,
        lname: user.lname,
        id: user.id,
        dcomAsset: user.dcomAsset,
        dcomLoc: user.dcomLoc,
        updateAsset: user.updateAsset,
        refreshToken: refreshToken,
        forcePassword: user.forcePassword,
        moveAsset: user.moveAsset,
        approveAssets: user.approveAssets,
        purchasePrice: user.purchasePrice,
        expires: decoded.exp,
        videos: videos
      };
console.log('result', result);
      ctx.body = result;
    } catch (e) {
      console.log(e);
      // e.g. "data is not a valid scrypt-encrypted block"
      ctx.throw(404, e.message);
      //ctx.throw(404, 'Username/password not found!');
    }
  }

  static async get(id) {
    const [[user]] = await global.db.query(
      `SELECT *
         FROM user
         WHERE id = :id`, {
        id
      }
    );
    user.password = null;
    return user;
  }

  static async getLocation(ctx) {
    const user = ctx.state.user ? await User.get(ctx.state.user.id) : null;

    const [locs] = await global.db.query(`SELECT u.locationID as id, l.name
                                              FROM userLocation u, location l
                                              WHERE u.locationID = l.id
                                                AND u.userID = :userID`, {
      userID: user.id
    });

    ctx.body = locs;

  }

  static async getAllAdmin(ctx) {
    const teamWhere = '';
    if (ctx.state.user.role === 1) {
      ctx.body = [];
      return;
    }
    const [users] = await global.db.query(`SELECT *
                                           FROM user
                                           ORDER BY fname, lname`);

    if (users.length) {
      for (let i in users) {
        users.userLocation = [];
        if (users[i].role === 1) {
          const [locs] = await global.db.query(`SELECT u.locationID, CONCAT(l.id, ' - ', l.name) as name
                                              FROM userLocation u, location l
                                              WHERE u.locationID = l.id
                                                AND u.userID = :userID`, {
            userID: users[i].id
          });
          if (locs.length) {
            users[i].userLocation = [];
            for (let l of locs) {
              console.log(l);
              users[i].userLocation.push(l);
            }
          }
        }
      }
    }

    ctx.body = users;
  }

  static async getRoles(ctx) {
    const [roles] = await global.db.query(
      'Select * From userRole order by id asc;'
    );
    ctx.body = roles;
  }

  static async resetValidate(ctx) {
    const resetCode = ctx.params.resetCode;
    const [code] = await global.db.query(`SELECT id
                                          FROM userReset
                                          where code = :code
                                            and expires > date_add(NOW(), INTERVAL 3 MINUTE)`, {
      code: resetCode
    });
    let ret = {
      result: code.length
    };
    ctx.body = ret;
  }

  static async resetEmail(ctx) {
    const resetCode = ctx.params.resetCode;
    const [
      [info]
    ] = await global.db.query(`SELECT userID
                                            FROM userReset
                                            where code = :code
                                              and expires > NOW()`, {
      code: resetCode
    });
    if (!info) {
      ctx.status = 403;
      ctx.body = {
        result: 'invalid or expired code'
      };
      return;
    }

    console.log(info);

    let password = '';
    let ret = {};
    if (ctx.request.body.password !== '' && ctx.request.body.password !== undefined) {
      while (password.length < 10) {
        password = scrypt.kdfSync(ctx.request.body.password, {
          N: 16,
          r: 8,
          p: 2,
        });
      }

      console.log('new pass', password);

      const res = await global.db.query('update user set password = :password where id = :id', {
        id: info.userID,
        password: password,
      });
      console.log('result', res);
      ret.result = 'password updated';
      ret.resultStatus = 'success';
    } else {
      ret.result = 'password is required';
      ret.resultStatus = 'danger';
    }

    ctx.body = ret;
  }

  static async getResetEmail(ctx) {
    console.log('body', ctx.request.body);
    const [
      [user]
    ] = await global.db.query(`select id
                                            from user
                                            where email = :email`, {
      email: ctx.request.body.email.toLowerCase()
    });
    if (user && user.id) {
      const resetCode = makeCode(50);
      const [res] = await global.db.query(`insert into userReset (userID, code, expires)
                                           values (:userID, :code, DATE_ADD(NOW(), INTERVAL 2 HOUR))`, {
        userID: user.id,
        code: resetCode
      });
      // Generate an email code and send the email.
      console.log('reset', resetCode, res);


      const mailOptions = {
        from: `noreply@mg.assets.familyradio.org`,
        to: ctx.request.body.email,
        subject: `Password Reset - Family Radio Assets`,
        text: `Please copy and paste this link into a browser to reset your password at assets.familyradio.org.  
        ${process.env.DOMAIN}/reset/${resetCode}`,
        html: `Please click this link to reset your password at assets.familyradio.org.  
               <a href = '${process.env.DOMAIN}/reset/${resetCode}'>${process.env.DOMAIN}/reset/${resetCode}</a>`
      };

      await User.sendUserEmail(ctx.request.body.email, mailOptions);


      ctx.body = {
        result: "Email Sent"
      };

    } else {
      ctx.body = {
        result: "Error: Email not found."
      };
      ctx.response.code = 403;
    }

  }

  static async updatePassword(ctx) {
    const user = ctx.state.user ? await User.get(ctx.state.user.id) : null;
    if (ctx.request.body.password && ctx.request.body.password.length > 3) {
      let newPassword = '';
      while (newPassword.length < 10) {
        newPassword = scrypt.kdfSync(ctx.request.body.password, {
          N: 16,
          r: 8,
          p: 2,
        });
      }
      const [res] = await global.db.query('update user set password = :password, forcePassword = 0 where id = :id', {
        id: user.id,
        password: newPassword
      });
      console.log({
        id: user.id,
        password: newPassword
      }, res);
      ctx.body = res;
    } else {
      ctx.body = {
        error: "password must be set."
      };
    }
  }

  static async save(ctx) {
    // console.log(ctx.request.body);

    if (ctx.request.body.password && ctx.request.body.password.length > 3) {
      let newPassword = '';
      while (newPassword.length < 10) {
        newPassword = scrypt.kdfSync(ctx.request.body.password, {
          N: 16,
          r: 8,
          p: 2,
        });
      }

      const resultPass = await global.db.query(
        'update user set password = :password where id = :id', {
          id: ctx.request.body.id,
          password: newPassword,
        }
      );

      if (ctx.request.body.sendEmail) {
        const mailOptions = {
          from: `noreply@mg.assets.familyradio.org`,
          to: ctx.request.body.email,
          subject: `Family Radio Assets - Updated Password`,
          text: `Your password has been updated at assets.familyradio.org.  
                Your Email for the site is ${ctx.request.body.email} and your updated password is ${ctx.request.body.password}
                You can log in at ${process.env.DOMAIN}.`,
          html: `Your password has been updated at assets.familyradio.org.<br> 
                <ul>
                  <li>Your Email for the site is ${ctx.request.body.email}</li>
                  <li>Your updated password is ${ctx.request.body.password}</li>
                  <li>You can log in at ${process.env.DOMAIN}</li>
                </ul>`
        };
        const result = await User.sendUserEmail(ctx.request.body.email, mailOptions);  
      }

    }

    const emailSend = ctx.request.body.emailSend ? ctx.request.body.emailSend : 0;

    // ctx.request.body.dcomLoc

    const result = await global.db.query(`update user 
                                          set email = :email, 
                                              fname = :fname, 
                                              lname = :lname, 
                                              role = :role, 
                                              phone = :phone,
                                              shipTo = :shipTo,
                                              status = :status, 
                                              dcomAsset = :dcomAsset,
                                              dcomLoc = :dcomLoc,
                                              updateAsset = :updateAsset,
                                              moveAsset = :moveAsset,
                                              approveAssets = :approveAssets,
                                              purchasePrice = :purchasePrice,
                                              forcePassword = :forcePassword
                                          where id = :id`, {
      id: ctx.params.userID,
      email: ctx.request.body.email,
      fname: ctx.request.body.fname,
      lname: ctx.request.body.lname,
      phone: ctx.request.body.phone,
      shipTo: ctx.request.body.shipTo,
      role: ctx.request.body.role,
      status: ctx.request.body.status,
      dcomAsset: ctx.request.body.dcomAsset,
      dcomLoc: ctx.request.body.dcomLoc,
      updateAsset: ctx.request.body.updateAsset,
      moveAsset: ctx.request.body.moveAsset,
      approveAssets: ctx.request.body.approveAssets,
      purchasePrice: ctx.request.body.purchasePrice,
      forcePassword: ctx.request.body.forcePassword
    });

    if (ctx.request.body.role === 1) {
      // Delete all locations from this user
      await global.db.query('delete from userLocation where userID = :userID', {
        userID: ctx.params.userID
      });

      // Add all of the locations in
      for (const location of ctx.request.body.userLocation) {
        await global.db.query('insert into userLocation (userID, locationID) values (:userID, :locationID)', {
          userID: ctx.params.userID,
          locationID: location.locationID
        });
      }
    }

    ctx.body = result;
  }

  static async deleteUser(ctx) {
    const result = await global.db.query('update user set status = 0 where id = :id', {
      id: ctx.params.userID,
    });
    ctx.body = result;
  }

  static async getBy(field, value) {
    try {
      const sql = `Select u.*
                     From user u 
                    Where u.${field} = :${field} 
                    Order By u.fname, u.lname`;
      const [users] = await global.db.query(sql, {
        [field]: value
      });

      return users;
    } catch (e) {
      switch (e.code) {
        case 'ER_BAD_FIELD_ERROR':
          throw new ModelError(403, 'Unrecognised User field ' + field);
        default:
          Lib.logException('User.getBy', e);
          throw new ModelError(500, e.message);
      }
    }
  }

  static async addToken(userID, refreshToken) {
    const sql = 'insert into userToken (userID, refreshToken) values (:userID, :refreshToken)';
    const ret = await global.db.query(sql, {
      userID: userID,
      refreshToken: refreshToken,
    });
    return ret;
  }

  static async getByToken(token) {
    const sql = `Select u.*, t.id as teamID, t.name as teamName, t.sharedData
                 From user u
                        left outer join team t on u.teamID = t.id
                 Where u.id in (select userID from userToken where refreshToken = :token)`;
    const [users] = await global.db.query(sql, {
      token: token
    });

    const sql2 = 'delete from userToken where refreshToken = :token'; //This token has been used, remove it.
    const res = await global.db.query(sql2, {
      token: token
    });

    return users;
  }

  static async register(ctx) {

    console.log(ctx.request.body);
    if (!ctx.request.body.password && !ctx.request.body.email) {
      ctx.request.body = JSON.parse(ctx.request.body);
    }

    let result = [];

    try {
      let newPassword = '';
      while (newPassword.length < 10) {
        newPassword = scrypt.kdfSync(ctx.request.body.password, {
          N: 16,
          r: 8,
          p: 2,
        });
      }
      const dcomLoc = ctx.request.body.dcomLoc ? ctx.request.body.dcomLoc : 0;
      [result] = await global.db.query(
        `insert into user (fname, lname, email, phone, shipTo, password, role, status, forcePassword, dcomAsset, dcomLoc, updateAsset, moveAsset, approveAssets, purchasePrice) 
         values (:fname, :lname, :email, :phone, :shipTo, :password, :role, :status, :forcePassword, :dcomAsset, :dcomLoc, :updateAsset, :moveAsset, :approveAssets, :purchasePrice)`, {
          fname: ctx.request.body.fname,
          lname: ctx.request.body.lname,
          email: ctx.request.body.email,
          phone: ctx.request.body.phone,
          shipTo: ctx.request.body.shipTo,
          password: newPassword,
          role: ctx.request.body.role,
          forcePassword: ctx.request.body.forcePassword,
          dcomAsset: ctx.request.body.dcomAsset,
          dcomLoc: dcomLoc,
          updateAsset: ctx.request.body.updateAsset,
          moveAsset: ctx.request.body.moveAsset,
          approveAssets: ctx.request.body.approveAssets,
          purchasePrice: ctx.request.body.purchasePrice,
          status: ctx.request.body.status
        }
      );



      if (Number(ctx.request.body.role) === 1) {
        // Add all of the locations in

        for (const location of ctx.request.body.userLocation) {
          await global.db.query('insert into userLocation (userID, locationID) values (:userID, :locationID)', {
            userID: result.insertId,
            locationID: location.locationID
          });
        }
      }

      if (ctx.request.body.sendEmail) {
        const mailOptions = {
          from: `noreply@mg.assets.familyradio.org`,
          to: ctx.request.body.email,
          subject: `Family Radio Assets - New Account`,
          text: `An account has been created for you at assets.familyradio.org.  
                 Your Email for the site is ${ctx.request.body.email} and your password is ${ctx.request.body.password}
                 You can log in at ${process.env.DOMAIN}, once you do you will be required to enter a new password.`,
          html: `An account has been created for you at assets.familyradio.org. <br> 
                 <ul>
                   <li>Your Email for the site is ${ctx.request.body.email}</li>
                   <li>Your password is ${ctx.request.body.password}</li>
                   <li>You can log in at ${process.env.DOMAIN}</li>
                   <li>Once you log in you will be required to enter a new password.</li>
                 </ul>`
        };

        // console.log(mailOptions);

        await User.sendUserEmail(ctx.request.body.email, mailOptions);

      }


    } catch (e) {
      console.log('error', e);
      result = [{
        error: 1
      }];
      throw (e);
    }

    ctx.body = result;

  }

  static async validateCode(ctx) {
    let result = [];
    try {
      [result] = await global.db.query(
        'select id, name from team where code = :code', {
          code: ctx.params.code
        }
      );
    } catch (e) {
      result = [{
        id: 0
      }];
    }
    if (!result[0]) {
      result = [{
        id: 0
      }];
    }
    ctx.body = result[0]; //Return only the ID
  }

  static async sendUserEmail(email, mailOptions) {
    const mail = new MailComposer(mailOptions);

    mail.compile().build((err, message) => {

      const dataToSend = {
        to: email,
        message: message.toString('ascii')
      };

      mailgun.messages().sendMime(dataToSend, (sendError, body) => {
        if (sendError) {
          console.log(sendError);
          return (sendError);
        }
        return ('okay');
      });
    });
  }

  static async getVideos(ctx) {
    console.log(ctx.state.user);
    ctx.body = await video.getUserVideos(ctx.state.user.id, ctx.state.user.role);
  }

  static async watchedVideo(ctx) {
    const [result] = await global.db.query(
      'insert into userVideo (userID, videoID, userVideo.when) values (:userID, :videoID, NOW())', {
        videoID: Number(ctx.params.videoID),
        userID: ctx.state.user.id
      });
    ctx.body = result;
  }
}

const makeCode = function (codeLength = 6) {
  let text = '';
  const possible = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
  for (let i = 0; i < codeLength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = User;