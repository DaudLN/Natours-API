const express = require('express');
const auth = require('../controller/authContoller');
const user = require('../controller/userController');

const userRouter = express.Router();

userRouter.post('/signup', auth.signup);
userRouter.post('/login', auth.login);
userRouter.post('/forgotPassword', auth.forgotPassword);
userRouter.patch('/resetPassword/:token', auth.resetPassword);
userRouter.post('/logout', auth.logout);

// All routes below are accessible on login
userRouter.use(auth.protect);
userRouter.get('/me', user.getMe, user.getUser);
userRouter.delete('/deleteMe', auth.restrictTo('user'), user.deleteMe);
userRouter.patch('/updateMe', user.updateMe);
userRouter.patch('/updateMyPassword', auth.updatePassword);

// All routes below are accessible by admin only
userRouter.use(auth.restrictTo('admin'));
userRouter.get('/', user.getUsers);
userRouter.delete('/deleteUser/:id', user.deleteUser);
userRouter.patch('/updateUser', user.updateUser);

module.exports = userRouter;
