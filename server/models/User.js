const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getDbStatus } = require('../config/db');
const StorageService = require('../services/storageService');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving in Mongoose
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper for Mongoose documents
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// Unified Interface that uses Mongoose if MongoDB is active, or StorageService if fallback mode
class UserModel {
  static async findByEmail(email) {
    const status = getDbStatus();
    if (status.connected) {
      return await MongooseUser.findOne({ email: email.toLowerCase() });
    }
    return await StorageService.findUserByEmail(email);
  }

  static async findById(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await MongooseUser.findById(id).select('-password');
    }
    const user = await StorageService.findUserById(id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async create({ name, email, password }) {
    const status = getDbStatus();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (status.connected) {
      const user = new MongooseUser({
        name,
        email,
        password // Mongoose pre-save also checks or we can pass hashed
      });
      user.password = hashedPassword;
      return await user.save();
    }

    return await StorageService.createUser({
      name,
      email,
      password: hashedPassword
    });
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
