const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // Adiciona os dados do usuário ao objeto req
            next();
        } catch (error) {
            console.error('Erro de autenticação:', error.message);
            res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    }
};

module.exports = protect;