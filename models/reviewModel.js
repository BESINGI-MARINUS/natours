const mongoose = require('mongoose');
const Tour = require('./../models/toursModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: { type: Number, min: 1, max: 5, default: 4.5 },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name',
  //   }).populate({
  //     path: 'tour',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Static model method to calculate ratingQuantity & numOfRatings
reviewSchema.statics.calcReviewStats = async function (tourId) {
  // this keyword points to the current model
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: tourId,
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: stats[0].avgRating,
      ratingQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to the current review document, this.contructor points to the Review model
  this.constructor.calcReviewStats(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // In a query middleware, 'this' points to the current query.
  this.r = await this.clone().findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcReviewStats(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
