const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res, next) => {
    const { nome_usuario, senha } = req.body;
    if (!nome_usuario || !senha) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        const senha_hash = await bcrypt.hash(senha, 10);
        const [result] = await pool.execute(
            'INSERT INTO usuarios_admin (nome_usuario, senha_hash) VALUES (?, ?)',
            [nome_usuario, senha_hash]
        );
        res.status(201).json({ message: 'Administrador registrado com sucesso!', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Nome de usuário já existe.' });
        }
        next(error);
    }
};

exports.loginAdmin = async (req, res, next) => {
    const { nome_usuario, senha } = req.body;
    if (!nome_usuario || !senha) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }
    try {
        const [rows] = await pool.execute(
            'SELECT id, senha_hash, nome_usuario FROM usuarios_admin WHERE nome_usuario = ?',
            [nome_usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(senha, user.senha_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user.id, nome_usuario: user.nome_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await pool.execute(
            'UPDATE usuarios_admin SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        next(error);
    }
};