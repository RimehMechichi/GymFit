const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  idUser: Number,
  NameUser: String,
  sexeUser: String,
  EmailUser: { type: String, unique: true, required: true },
  roleUser: String,
  telUser: String,
  adressUser: String,
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) { // Avoid re-hashing an already hashed password
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
