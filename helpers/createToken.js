const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

// This is a heloper function that creates a token

const createToken = (user) => {
  let payload = {
    username: user.username,
    is_admin: user.is_admin,
  };

  return jwt.sign(payload, SECRET_KEY);
};

module.exports = createToken;
