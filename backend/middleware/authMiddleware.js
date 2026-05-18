const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');


const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized, no session token found', 401);
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return sendError(res, 'User session invalid, account not found', 401);
    }

    next();
  } catch (error) {
    console.error(`[Auth Middleware Error]: ${error.message}`);
    return sendError(res, 'Not authorized, session token expired or invalid', 401);
  }
};


const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Access denied, administrative credentials required', 403);
  }
};

module.exports = {
  protect,
  admin,
};
