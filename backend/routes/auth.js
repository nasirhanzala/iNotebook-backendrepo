
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET = "mysecretkey";

// ROUTE 1: Create User
router.post(
  '/createuser',
  [
    body('name', 'Name must be at least 3 characters').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({
          success: false,
          error: "Sorry, a user with this email already exists"
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      });

      const data = {
        user: {
          id: user.id
        }
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({
        success: true,
        authtoken
      });

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 2: Login User
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
  ],
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    try {

      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Please try to login with correct credentials"
        });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        return res.status(400).json({
          success: false,
          error: "Please try to login with correct credentials"
        });
      }

      const data = {
        user: {
          id: user.id
        }
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({
        success: true,
        authtoken
      });

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Get Logged In User Details
router.post('/getuser', fetchUser, async (req, res) => {

  try {

    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    res.send(user);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

});

module.exports = router;