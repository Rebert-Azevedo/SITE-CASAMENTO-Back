const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginAdmin);
router.post('/register', authController.registerAdmin); // Considere remover ou proteger após o primeiro admin ser criado.

module.exports = router;