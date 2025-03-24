const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const auth = require('../middleware/auth');

// All investment routes are protected
router.use(auth);

// Get all investments for current user
router.get('/', investmentController.getUserInvestments);

// Get investment by ID
router.get('/:id', investmentController.getInvestmentById);

// Create a new investment
router.post('/', investmentController.createInvestment);

// Calculate projected returns (doesn't create an investment)
router.post('/calculate-returns', investmentController.calculateProjectedReturns);

module.exports = router;
