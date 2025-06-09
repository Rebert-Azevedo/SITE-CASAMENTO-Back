const express = require('express');
const router = express.Router();
const rsvpController = require('../controllers/rsvpController');
const protect = require('../middleware/authMiddleware'); // Middleware de autenticação

// Rota Pública (para convidados)
router.post('/', rsvpController.submitRsvp); // Envia ou atualiza o RSVP

// Rotas Protegidas (para administradores)
router.get('/admin', protect, rsvpController.getAllRsvpsAdmin); // Lista todos os RSVPs
router.put('/admin/:rsvp_id', protect, rsvpController.updateRsvpAdmin); // Atualiza um RSVP
router.delete('/admin/:rsvp_id', protect, rsvpController.deleteRsvpAdmin); // Deleta um RSVP

module.exports = router;