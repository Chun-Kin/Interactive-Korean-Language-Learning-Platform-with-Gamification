const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hash a password
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare passwords
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate a JWT token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};