const Tour = require('../models/toursModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) next(new AppError('There is no tour with that name!', 404));

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.login = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'My Account',
  });
};
