const express = require('express');
const viewController = require('../Controllers/viewController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.use(authController.isLogedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.login);

module.exports = router;
