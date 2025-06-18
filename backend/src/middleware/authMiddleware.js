require('dotenv').config();

const protect = (req, res, next) => {
    const adminKey = req.query.key || req.headers['x-admin-key'];
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY;

    if (!adminKey) {
        return res.status(401).json({ message: 'Acesso não autorizado: Chave de administrador não fornecida.' });
    }

    if (adminKey !== expectedSecretKey) {
        return res.status(401).json({ message: 'Acesso não autorizado: Chave de administrador inválida.' });
    }

    next();
};

module.exports = protect;