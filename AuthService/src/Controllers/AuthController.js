const User = require('../Models/User');
const redis = require('redis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzM0MzU0NDc3LCJleHAiOjE3MzQzNTgwNzd9.GD7sNMnW7n3lFbT0c2Fh2vbIFB-KEKxCURL9RK0d6EI"; 





// Register a New User
exports.register = async (req, res) => {
  try {
    const { idUser, NameUser, sexeUser, EmailUser, roleUser, telUser, adressUser, password } = req.body;

    const newUser = new User({
      idUser,
      NameUser,
      sexeUser,
      EmailUser,
      roleUser,
      telUser,
      adressUser,
      password, // Pass the raw password here, the pre('save') hook will hash it
    });

    const savedUser = await newUser.save();
    console.log('User saved:', savedUser);

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).send(err.message);
  }
};



exports.login = async (req, res) => {
  try {
    const { EmailUser, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ EmailUser });
    if (!user) {
      console.error('User not found:', EmailUser);
      return res.status(404).send('User not found');
    }

    // Debugging the comparison
    console.log('Raw Password from Request:', password);
    console.log('Stored Hashed Password:', user.password);

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.error('Invalid password');
      return res.status(400).send('Invalid credentials');
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.idUser }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).send(err.message);
  }
};

// Logout User
exports.logout = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send('No token provided');
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).send('Invalid token');
      }

      // Blacklist token in Redis
      client.set(token, 'blacklisted', 'EX', 3600, (err, reply) => {
        if (err) {
          console.error('Redis error:', err);
          return res.status(500).send('Internal server error');
        }

        res.status(200).send('User signed out successfully');
      });
    });
  } catch (err) {
    console.error('Error during logout:', err.message);
    res.status(500).send('Error during logout');
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { EmailUser } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ EmailUser });
    if (!user) return res.status(404).send('User not found');

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const resetLink = `http://localhost:3002/auth/reset-password?token=${token}`;

    // Save the token and its expiration to the database
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Log the reset token for debugging
    console.log('Reset Token:', user.resetToken);
    console.log('Reset Token Expiry:', user.resetTokenExpiry);

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: EmailUser,
      subject: 'Password Recovery',
      text: `Hello ${user.NameUser},\n\nClick the link below to reset your password:\n${resetLink}\n\nThank you!`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).send(`Password recovery email sent to ${EmailUser}`);
  } catch (err) {
    console.error('Error sending recovery email:', err);
    res.status(500).send({ message: 'Error sending password recovery email', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).send('Password must be at least 8 characters long');
    }

    const user = await User.findOne({ resetToken: token });
    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(404).send('Invalid or expired token');
    }

    // Directly assign the new password; it will be hashed by the pre('save') hook
    user.password = newPassword; 
    user.resetToken = undefined; // Clear token
    user.resetTokenExpiry = undefined;

    await user.save(); // 'pre' hook will hash the password here
    res.status(200).send('Password updated successfully');
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).send('Error resetting password');
  }
};

// Middleware to Check Blacklisted Tokens
exports.checkBlacklist = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  client.get(token, (err, reply) => {
    if (err) {
      console.error('Error checking blacklist:', err);
      return res.status(500).send('Internal server error');
    }

    if (reply === 'blacklisted') {
      return res.status(401).send('Token is invalid');
    }

    next();
  });
};