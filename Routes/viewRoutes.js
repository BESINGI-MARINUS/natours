const express = require('express');
const viewController = require('../Controllers/viewController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.get('/', authController.isLogedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLogedIn, viewController.getTour);
router.get('/login', authController.isLogedIn, viewController.login);
router.get('/me', authController.protect, viewController.getAccount);

module.exports = router;
