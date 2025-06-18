const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Importa o controller
const protect = require('../middleware/authMiddleware'); // Importa o middleware de proteção

router.get('/validate-key', protect, authController.validateSecretKey);

module.exports = router;