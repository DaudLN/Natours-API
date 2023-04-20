const express = require('express');
const reviewContoller = require('../controller/reviewContoller');
const auth = require('../controller/authContoller');

// Merging params from parent router
const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.use(auth.protect);
reviewRouter
  .route('/')
  .get(reviewContoller.getAllReviews)
  .post(
    auth.restrictTo('user'),
    reviewContoller.setTourUserIds,
    reviewContoller.createReview
  );
reviewRouter
  .route('/:id')
  .get(reviewContoller.getReview)
  .patch(auth.restrictTo('user', 'admin'), reviewContoller.updateReview)
  .delete(auth.restrictTo('user', 'admin'), reviewContoller.deleteReview);

module.exports = reviewRouter;
