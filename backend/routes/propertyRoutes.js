const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

// Get all properties (public route)
router.get('/', propertyController.getAllProperties);

// Get property by ID (public route)
router.get('/:id', propertyController.getPropertyById);

// Create a new property (protected route, admin only in real app)
router.post('/', auth, propertyController.createProperty);

// Update property status (protected route, admin only in real app)
router.patch('/:id/status', auth, propertyController.updatePropertyStatus);

module.exports = router;
