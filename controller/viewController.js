const status = require('statuses');
const catchAsync = require('../util/catchAsync');
const Tour = require('../models/tourModel');

exports.getOverView = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(status('OK')).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(status('OK')).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(status('OK')).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res
    .status(status('OK'))
    .render('login', { title: 'Login into your account' });
});

exports.signup = catchAsync(async (req, res, next) => {
  res.status(status('OK')).render('signup', { title: 'Create account' });
});
