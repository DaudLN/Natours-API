const express = require('express');
const tourContoller = require('../controller/tourController');
const auth = require('../controller/authContoller');
const reviewRouter = require('./reviewRouter');

const tourRouter = express.Router();

// Defining params middleware check id before other middlewares eg tour, get ...
// tourRouter.param('id', tour.checkId);
// Routing to tour

// Nested router to reviews
tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/top-5-cheap')
  .get(tourContoller.topFiveCheapestTours, tourContoller.getAllTours);

// tourRouter.use(auth.protect);
tourRouter.route('/stats').get(tourContoller.tourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    auth.restrictTo('admin', 'guide', 'lead-guide'),
    tourContoller.getMonthlyPlan
  );

tourRouter
  .route('/')
  .get(tourContoller.getAllTours)
  .post(auth.restrictTo('admin', 'lead-guide'), tourContoller.createTour);

tourRouter
  .route('/:id')
  .get(tourContoller.getTour)
  .patch(tourContoller.updateTour)
  .delete(auth.restrictTo('admin', 'lead-guide'), tourContoller.deleteTour);

module.exports = tourRouter;
