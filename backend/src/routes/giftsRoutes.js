const express = require('express');
const router = express.Router();
const giftsController = require('../controllers/giftsController');
const protect = require('../middleware/authMiddleware');

// Rotas Públicas (para convidados - NÃO exigem autenticação)
router.get('/', giftsController.getAllGifts); // Lista os presentes disponíveis e reservados (público)
router.post('/:id/reserve', giftsController.reserveGift); // Convidados reservam um presente

// Rotas Protegidas (para administradores - EXIGEM autenticação)
router.get('/admin', protect, giftsController.getAllGiftsAdmin); // Lista todos os presentes com detalhes de reserva para admin
router.post('/', protect, giftsController.createGift); // Adicionar um presente
router.put('/:id', protect, giftsController.updateGift); // Atualizar um presente
router.delete('/:id', protect, giftsController.deleteGift); // Excluir um presente

module.exports = router;