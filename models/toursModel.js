const mongoose = require('mongoose');
const slugify = require('slugify');

// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'Tour name must be atleast 10 characters long.'],
      maxlength: [40, 'Tour name must be atmost 40 characters long.'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulty can only be: Easy, medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The minimum rating is 1'],
      max: [5, 'The maximum rating is 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) cannot be greater than the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secreteTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // Referencing/normalization
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // This is the model name that we want to reference
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE runs only before the .save() and .create() commands are executed
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken',
  });
  next();
});

// Embeding/Denomalization
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   const guides = await Promise.all(guidePromises);
//   this.guides = guides;

//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log('Post save hook: ', doc);
//   next();
// });

// QUERY MIDDLEWARE. Runs before a query is executed
tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } });

  this.startTime = Date.now();
  next();
});

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(
//     `Query took ${(Date.now() - this.startTime) / 1000} seconds to execute`,
//   );
//   next();
// });

// AGGREGATION MIDDLEWARE. // Commented this because geoNear is supposed to be the first stage in the aggregation pipeline. check tourController.getDistances
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
