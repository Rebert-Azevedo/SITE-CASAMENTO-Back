const { pool } = require('../config/db');

exports.getAllCategories = async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT id, nome, descricao FROM categorias ORDER BY nome ASC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        next(error);
    }
};
