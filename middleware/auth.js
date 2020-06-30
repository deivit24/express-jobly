// Auth and Admin Middleware

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/ExpressError');

// This is middleware to make sure a user is authorized

const isAuth = (req, res, next) => {
  try {
    const tokenJWT = req.body._token || req.query._token;

    let token = jwt.verify(tokenJWT, SECRET_KEY);
    res.locals.username = token.username;
    return next();
  } catch (e) {
    return next(new ExpressError('You must authenticate first', 401));
  }
};

// This is a middleware to make sure the user is an admin

const isAdmin = (req, res, next) => {
  try {
    const tokenJWT = req.body._token;

    let token = jwt.verify(tokenJWT, SECRET_KEY);
    res.locals.username = token.username;

    if (token.is_admin) {
      return next();
    }

    // throw an error, so we catch it in our catch, below
    throw new Error();
  } catch (err) {
    return next(new ExpressError('You must be an admin to access', 401));
  }
};

// This middleware is to make sure that the user is the correct user

const isUser = (req, res, next) => {
  try {
    const tokenStr = req.body._token;

    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    if (token.username === req.params.username) {
      return next();
    }

    // throw an error, so we catch it in our catch, below
    throw new Error();
  } catch (err) {
    return next(new ExpressError('Unauthorized', 401));
  }
};

module.exports = {
  isAuth,
  isAdmin,
  isUser,
};
