const db = require('../models/model');
const bcrypt = require('bcrypt');

const usersController = {
  validateUsername: async (req, res, next) => {
    try {
      const { user } = req.body;
      const searchQuery = 'SELECT username FROM users WHERE username = $1';
      const searchParams = [user];
      const { rowCount } = await db.query(searchQuery, searchParams);
      console.log('Number of matches found in db: ', rowCount);
      if (rowCount) return next({ err: 'error username already taken' });
      return next();
    } catch (err) {
      return next({
        err: 'Error in usersController.createUser. Could not query database for username.',
      });
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { user, password } = req.body;
      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) console.log('Bcrypt error in userController:', err);
        let queryStr =
          'INSERT INTO users (userName, password, groups, friends, post_count) VALUES ($1, $2, $3, $4, $5)';
        const results = await db.query(queryStr, [
          user,
          hash,
          JSON.stringify({}),
          JSON.stringify({}),
          JSON.stringify({}),
        ]);
        console.log(`New user ${res.locals.newUser} created.`);
        return next();
      });
    } catch (err) {
      return next({
        err: 'Error in usersController.createUser. Could not create user',
      });
    }
  },
  verifyUser: async (req, res, next) => {
    try {
      const { user, password } = req.body;
      const searchQuery =
        'SELECT username, password FROM users WHERE username = $1';
      const searchParams = [user];
      const findUser = await db.query(searchQuery, searchParams);
      const ePass = findUser.rows[0].password;
      console.log(ePass);
      if (!findUser) return next();

      bcrypt.compare(password, ePass, (err, results) => {
        if (err) console.log(`Bcrypt err in usersController.verifyUser ${err}`);
        res.locals.verified = results;
        next();
      });
    } catch (err) {
      next({
        log: 'Error in userController.verifyUser',
        message: { err: `Could not verify user. ERRORL ${err}` },
      });
    }
  },
};

module.exports = usersController;
