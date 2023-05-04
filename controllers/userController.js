import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      let token = generateToken(user._id);
      res.cookie('userToken', token, {
        expires: new Date(Date.now() + 3000000000),
        httpOnly: true
      });
      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token,
      });
    } else {
      res.status(401).json({ success: false, message: 'Please enter valid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//@description     Register new user
//@route           POST /api/users/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;

    let success = false;
    if (!name || !email || !password) {
      res.status(400).json({ success, message: 'Please include all the fields' });
    }

    // Find if user already exists.....
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(404).json({ success, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    if (user) {
      success = true;
      let token = generateToken(user._id);
      res.cookie('userToken', token, {
        expires: new Date(Date.now() + 3000000000),
        httpOnly: true
      });
      res.status(201).json({
        success,
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token,
      });
    } else {
      res.status(400).json({ success, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @desc    GET user profile
// @route   GET /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.pic = req.body.pic || user.pic;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      let token = generateToken(updatedUser._id);
      res.status(200).json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
        isAdmin: updatedUser.isAdmin,
        token,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export { authUser, updateUserProfile, registerUser };