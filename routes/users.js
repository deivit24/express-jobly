//Routes for users

const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { isUser, isAuth } = require('../middleware/auth');
const User = require('../models/User');
const { validate } = require('jsonschema');
const { userNewSchema, userUpdateSchema } = require('../schemas/user/user');
const createToken = require('../helpers/createToken');

const router = express.Router();

// Get all users

router.get('/', isAuth, async function (req, res, next) {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (e) {
    return next(e);
  }
});

// Get by users by username

router.get('/:username', isAuth, async function (req, res, next) {
  try {
    const user = await User.getByUsername(req.params.username);
    return res.json({ user });
  } catch (e) {
    return next(e);
  }
});

// Register user

router.post('/', async function (req, res, next) {
  try {
    const validation = validate(req.body, userNewSchema);

    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      );
    }

    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (e) {
    return next(e);
  }
});

// EDIT / PATCH ROUTE Smart OOP way

router.patch('/:username', isUser, async function (req, res, next) {
  try {
    if ('username' in req.body || 'is_admin' in req.body) {
      throw new ExpressError(
        'You are not allowed to change username or is_admin properties.',
        400
      );
    }

    const validation = validate(req.body, userUpdateSchema);
    if (!validation.valid) {
      throw new ExpressError(
        validation.errors.map((e) => e.stack),
        400
      );
    }
    var user = await User.getByUsername(req.params.username);
    if (!user) {
      throw new ExpressError(
        `There exists no user '${req.params.username}'`,
        404
      );
    }

    await user.save(user.username, req.body);

    var user = await User.getByUsername(req.params.username);

    // const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (e) {
    return next(e);
  }
});

// Deletes a user if users match

router.delete('/:username', isUser, async function (req, res, next) {
  try {
    let user = await User.getByUsername(req.params.username);

    await user.remove();

    return res.json({ message: 'User deleted' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
