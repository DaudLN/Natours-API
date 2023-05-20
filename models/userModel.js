const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { promisify } = require('util');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  // phone: {
  //   type: String,
  //   validate: [validator.isMobilePhone],
  // },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm password is required'],
    validate: {
      validator: function (el) {
        // Only work on create and save
        return el === this.password;
      },
      message: 'Password do not match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Place to hash password using bcrypt library
userSchema.pre('save', async function (next) {
  // Only run if password was actually changed
  if (!this.isModified('password')) return next();

  // Encrypt password
  const hash = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, hash);
  this.passwordConfirm = undefined; // Removing passwordConfirm field. Not to persist in the database
  next();
});

/*Mongo has instance methods that run after the schema is create or need.

This below is an instance method that compares hashed password and the
supplied password by the user after login */

userSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create jsonwebtoken
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Verify jsonwebtoken
userSchema.methods.verifyAuthToken = async function (token) {
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

// Update passwordChangedAt when changed
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/* This Moongose query middleware will run to any query with
intension of finding documents (users) from the database and
not to select inactive users and it points to current query
which is any find query */
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestap = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestap;
  }
  return false;
};

userSchema.methods.createRandomPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //The token will expire after 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
