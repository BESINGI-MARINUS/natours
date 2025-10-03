const express = require('express');
const viewController = require('../Controllers/viewController');
const authController = require('../Controllers/authController');
const bookingController = require('../Controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createCheckoutBooking,
  authController.isLogedIn,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.isLogedIn, viewController.getTour);
router.get('/login', authController.isLogedIn, viewController.login);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);
router.get('/signup', viewController.signup);

module.exports = router;
