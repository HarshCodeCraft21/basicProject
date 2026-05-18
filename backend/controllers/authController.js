const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess } = require('../utils/responseHandler');


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields (name, email, password)');
  }

  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email address already exists');
  }

  
  
  const userRole = role && ['user', 'admin'].includes(role) ? role : 'user';

  
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  if (user) {
    
    const token = generateToken(res, user._id);

    sendSuccess(
      res,
      'Registration successful',
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
      201
    );
  } else {
    res.status(400);
    throw new Error('Invalid user details provided');
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter both email and password');
  }

  
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    
    const token = generateToken(res, user._id);

    sendSuccess(res, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


const logoutUser = asyncHandler(async (req, res) => {
  
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  sendSuccess(res, 'Logged out successfully');
});


const getCurrentUser = asyncHandler(async (req, res) => {
  
  sendSuccess(res, 'User profile fetched successfully', req.user);
});


const updateUserProfile = asyncHandler(async (req, res) => {
  const { address, phone } = req.body;

  if (!address || !phone) {
    res.status(400);
    throw new Error('Please fill in both full address and phone number');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.address = address;
    user.phone = phone;

    const updatedUser = await user.save();

    sendSuccess(res, 'User profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      address: updatedUser.address,
      phone: updatedUser.phone,
    });
  } else {
    res.status(404);
    throw new Error('User account not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
};
