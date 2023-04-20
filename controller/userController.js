const _ = require('lodash');
const status = require('statuses');
const AppError = require('../util/AppError');
const baseURL = require('../util/baseURL');
const catchAsync = require('../util/catchAsync');
const User = require('../models/userModel');
const handler = require('./handlerFactory');

class UserController {
  getUsers = handler.getAll(User);
  getUser = handler.getOne(User);
  updateUser = handler.updateOne(User); //TO ADMIN: Do dont update password here
  deleteUser = handler.deleteOne(User);

  getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };
  // Update me -> The user should not update password here.
  updateMe = catchAsync(async (req, res, next) => {
    // Create an error if user want to update password here
    if (req.body.password || req.body.password)
      return next(
        new AppError(
          status('Bad Request'),
          `To update password, visit ${baseURL(req)}/users/updateMyPassword`
        )
      );
    const updateData = _.pick(req.body, ['name', 'email']);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select(['-__v', '-_id', '-role']);
    res.status(status('OK')).json({
      message: 'success',
      data: updatedUser,
    });
  });

  /* Delete a user: 
  Actually we allow a user to delete h/her self,
  but in reality we don't delete h/her account in the database.
  Instead we use to set active propert to false. */

  deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(status('No Content')).json({
      message: 'success',
      data: null,
    });
  });
}

const userController = new UserController();
module.exports = userController;
