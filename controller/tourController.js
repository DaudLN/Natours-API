const status = require('statuses');
const catchAsync = require('../util/catchAsync');
const handler = require('./handlerFactory');
const Tour = require('../models/tourModel');

class TourController {
  topFiveCheapestTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,-ratingsAverage';
    req.query.fields = 'name,duration,difficulty,summary,price,ratingsAverage';

    next();
  };

  getAllTours = handler.getAll(Tour);
  getTour = handler.getOne(Tour, { path: 'reviews' });
  updateTour = handler.updateOne(Tour);
  deleteTour = handler.deleteOne(Tour);

  // post endpoint
  createTour = handler.createOne(Tour, [
    'name',
    'duration',
    'maxGroupSize',
    'difficulty',
    'ratingsAverage',
    'ratingsQuantity',
    'price',
    'priceDiscount',
    'summary',
    'description',
    'imageCover',
    'images',
    'createdAt',
    'startDates',
    'rating',
    'startLocation',
    'coordinates',
    'guides',
    'secreteTour',
  ]);

  // Update Tour

  tourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$id' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // { $match: { _id: { $ne: 'EASY' } } },
    ]);
    res.status(status('OK')).json({
      status: 'Success',
      stats,
    });
  });

  getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numbToursStart: { $sum: 1 },
        },
      },
      {
        $sort: { numbToursStart: 1 },
      },
    ]);
    res.status(status('OK')).json({
      status: 'Status',
      result: plan.length,
      message: plan,
    });
  });
}
const tourContoller = new TourController();
module.exports = tourContoller;
