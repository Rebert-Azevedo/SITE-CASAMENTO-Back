const { pool } = require('../config/db');

// ADMIN - Obter todos os convidados
exports.getAllGuestsAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT id, nome_completo, telefone, quantidade_criancas, data_registro FROM convidados ORDER BY data_registro DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar convidados para admin:', error);
        next(error);
    }
};

// ADMIN - Criar um novo convidado
exports.createGuest = async (req, res, next) => {
    const { nome_completo, telefone, quantidade_criancas } = req.body;
    if (!nome_completo || !telefone) {
        return res.status(400).json({ message: 'Nome completo e telefone são obrigatórios para o convidado.' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO convidados (nome_completo, telefone, quantidade_criancas) VALUES (?, ?, ?)',
            [nome_completo, telefone, quantidade_criancas || 0]
        );
        res.status(201).json({ message: 'Convidado adicionado com sucesso!', guestId: result.insertId });
    } catch (error) {
        console.error('Erro ao criar convidado:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Um convidado com este telefone já existe.' });
        }
        next(error);
    }
};

// ADMIN - Atualizar um convidado existente
exports.updateGuest = async (req, res, next) => {
    const { id } = req.params;
    const { nome_completo, telefone, quantidade_criancas } = req.body;
    if (!nome_completo || !telefone) {
        return res.status(400).json({ message: 'Nome completo e telefone são obrigatórios para o convidado.' });
    }
    try {
        const [result] = await pool.execute(
            'UPDATE convidados SET nome_completo = ?, telefone = ?, quantidade_criancas = ? WHERE id = ?',
            [nome_completo, telefone, quantidade_criancas || 0, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Convidado não encontrado.' });
        }
        res.status(200).json({ message: 'Convidado atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar convidado:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Um convidado com este telefone já existe.' });
        }
        next(error);
    }
};

// ADMIN - Deletar um convidado
exports.deleteGuest = async (req, res, next) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM convidados WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Convidado não encontrado.' });
        }
        res.status(200).json({ message: 'Convidado excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar convidado:', error);
        next(error);
    }
};