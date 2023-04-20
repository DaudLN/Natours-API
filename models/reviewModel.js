const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: { type: String, required: [true, 'Review can not be empty'] },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now() },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// reviewSchema.pre(/^find/, function () {
//   this.populate({
//     path: 'tour',
//     select: 'name',
//   }).populate({
//     path: 'user',
//     select: 'name photo',
//   });
// });

// populate the review with user
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Calculating average ratings
reviewSchema.statics.calculateAverageRatings = async function (tourID) {
  const stats = await this.aggregate([
    { $match: { tour: tourID } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        totalRating: { $sum: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourID, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
    totalRating: stats[0].totalRating,
  });
  console.log(stats[0].avgRating);
};

reviewSchema.post('save', function () {
  // this.constructor points to Review Model
  this.constructor.calculateAverageRatings(this.tour);
});

// Updating the tour ratingsQuantity and ratingsAverage
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calculateAverageRatings(this.r.tour);
  next();
});

// Making only one review for one user in the same tour
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
