const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const status = require('statuses');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const sendEmail = require('../util/email');
const User = require('../models/userModel');

class Auth {
  creatAndSendToken = (user, statusCode, res) => {
    const token = user.generateAuthToken();
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: 'Strict',
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('natourAPIJWT', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
      status: 'success',
      token,
    });
  };

  createToken = (user, statusCode, res) => {
    res.status(statusCode).json({
      status: 'success',
      token: user.generateAuthToken(),
    });
  };

  signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm, passwordChangedAt } =
      req.body;

    const user = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      passwordChangedAt,
    });
    this.creatAndSendToken(user, status('Created'), res);
  });

  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
      return next(
        new AppError(status('Bad Request'), `Please provide email and password`)
      );
    const user = await User.findOne({ email }).select(['+password']);
    if (!user || !(await user.checkPassword(password))) {
      return next(
        new AppError(status('Unauthorized'), `Invalid email or password`)
      );
    }
    this.creatAndSendToken(user, status('OK'), res);
  });

  logout = catchAsync(async (req, res) => {
    res.cookie('natourAPIJWT', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(status('OK')).json({
      status: 'success',
      message: 'You have successfull logout',
    });
  });

  getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(
        new AppError(status('Forbidden'), `No user with id ${req.params.id}`)
      );
    res.status(status('OK')).json({
      user,
    });
  });

  deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return next(
        new AppError(status('Not Found'), `No user with id ${req.params.id}`)
      );
    res.status(status('No Content')).json({
      status: 'success',
    });
  });

  protect = catchAsync(async (req, res, next) => {
    // 1. Get token and check if exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.natourAPIJWT) {
      token = req.cookies.natourAPIJWT;
    }
    if (!token)
      return next(
        new AppError(
          status('Unauthorized'),
          'You are not logged in. Please, signin to your account'
        )
      );

    // 2. Verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. If the user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          status('Unauthorized'),
          'User with this token no longer exists'
        )
      );
    }

    // 4. If user change password after token issued
    if (currentUser.changePasswordAfter(decoded.iat))
      return next(
        new AppError(
          status('Unauthorized'),
          'User changed password recently. Please login again'
        )
      );
    req.user = currentUser;
    next();
  });

  isLoggedIn = catchAsync(async (req, res, next) => {
    // 1. Verify token sent from the browser
    if (req.cookies.natourAPIJWT) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.natourAPIJWT,
        process.env.JWT_SECRET
      );

      // 2. If the user exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3. If user change password after token issued
      if (currentUser.changePasswordAfter(decoded.iat)) return next();

      // There is login user
      // 4. Pass data (current user to the templates using locals)
      res.locals.user = currentUser;
      return next();
    }
    return next();
  });

  forgotPassword = catchAsync(async (req, res, next) => {
    // 1. Get user based on post request
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return next(
        new AppError(status('OK'), 'No user with this email address')
      );

    // 2. Generate random password reset token
    const resetToken = user.createRandomPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send it to user's email account
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forget your password? Create new password using this url ${resetURL}\n. If you don't request password reset, please ignore this email!`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (Valid for 10minutes)',
        message,
      });
      res.status(status('OK')).json({
        status: 'success',
        message: 'Reset link sent via your email address',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          status('Internal Server Error'),
          'There was an error while sending email'
        )
      );
    }
  });

  resetPassword = catchAsync(async (req, res, next) => {
    // 1. Obtain user based on reset token
    const hashedToke = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToke,
      passwordResetTokenExpires: { $gt: Date.now() },
    });
    if (!user)
      return next(
        new AppError(status('Bad Request'), 'Token is invalid or has expired')
      );

    // 2. Reseting password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    // 3. Change passwordChangeAt

    // 4. Log the user in, send JWT
    this.createToken(user, status('Created'), res);
    // next();
  });

  updatePassword = catchAsync(async (req, res, next) => {
    // Get user from collection
    // Not to use findAndUpdate funct while updating password
    const user = await User.findById(req.user._id).select('password');
    // Check if posted password is correct
    if (!(await user.checkPassword(req.body.currentPassword, user.password)))
      return next(
        new AppError(
          status('Unauthorized'),
          'The previous password is incorrect'
        )
      );
    const { password, passwordConfirm } = req.body;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    this.createToken(user, status('Created'), res);
  });

  restrictTo =
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError(
            status('Forbidden'),
            'You are not authorized to perform this operation'
          )
        );
      }
      next();
    };
}

const auth = new Auth();
module.exports = auth;
