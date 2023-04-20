const handler = require('./handlerFactory');
const Review = require('../models/reviewModel');

class ReviewController {
  setTourUserIds = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;
    if (!req.body.tour) req.body.tour = req.params.tourId;
    next();
  };
  createReview = handler.createOne(Review, [
    'review',
    'rating',
    'tour',
    'user',
  ]);
  getAllReviews = handler.getAll(Review);
  getReview = handler.getOne(Review);
  updateReview = handler.updateOne(Review);
  deleteReview = handler.deleteOne(Review);
}
const review = new ReviewController();
module.exports = review;
