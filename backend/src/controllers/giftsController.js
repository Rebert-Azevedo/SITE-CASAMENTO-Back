const { pool } = require('../config/db');

// CONVIDADOS - Obter todos os presentes disponíveis/reservados
exports.getAllGifts = async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT id, categoria_id, nome, descricao, valor_estimado, imagem_url, url_compra, status FROM presentes WHERE status IN ("disponível", "reservado") ORDER BY id DESC');
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// CONVIDADOS - Reservar um presente
exports.reserveGift = async (req, res, next) => {
    const { id } = req.params; // ID do presente
    const { nome_reservou, email_reservou, mensagem } = req.body;
    if (!nome_reservou || !email_reservou) {
        return res.status(400).json({ message: 'Nome e e-mail são obrigatórios para reservar.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [giftRows] = await connection.execute(
            'SELECT status FROM presentes WHERE id = ? FOR UPDATE',
            [id]
        );

        if (giftRows.length === 0 || giftRows[0].status !== 'disponível') {
            await connection.rollback();
            return res.status(409).json({ message: 'Presente não está disponível para reserva.' });
        }

        // Inserir a reserva
        await connection.execute(
            'INSERT INTO reservas (presente_id, nome_reservou, email_reservou, mensagem) VALUES (?, ?, ?, ?)',
            [id, nome_reservou, email_reservou, mensagem]
        );

        // Atualizar o status do presente
        await connection.execute(
            'UPDATE presentes SET status = "reservado" WHERE id = ?',
            [id]
        );

        await connection.commit();
        res.status(200).json({ message: 'Presente reservado com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// ADMIN - Obter todos os presentes com detalhes de reserva
exports.getAllGiftsAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.id, p.nome, p.descricao, p.valor_estimado, p.imagem_url, p.url_compra, p.status, 
                    c.nome AS categoria_nome, r.nome_reservou, r.email_reservou, r.data_reserva, r.mensagem AS reserva_mensagem
             FROM presentes p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             LEFT JOIN reservas r ON p.id = r.presente_id
             ORDER BY p.id DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// ADMIN - Criar um novo presente
exports.createGift = async (req, res, next) => {
    const { categoria_id, nome, descricao, valor_estimado, url_compra, imagem_url } = req.body;
    if (!nome) {
        return res.status(400).json({ message: 'O nome do presente é obrigatório.' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO presentes (categoria_id, nome, descricao, valor_estimado, url_compra, imagem_url) VALUES (?, ?, ?, ?, ?, ?)',
            [categoria_id, nome, descricao, valor_estimado, url_compra, imagem_url]
        );
        res.status(201).json({ message: 'Presente criado com sucesso!', giftId: result.insertId });
    } catch (error) {
        next(error);
    }
};

// ADMIN - Atualizar um presente existente
exports.updateGift = async (req, res, next) => {
    const { id } = req.params;
    const { categoria_id, nome, descricao, valor_estimado, url_compra, imagem_url, status } = req.body;
    try {
        const [result] = await pool.execute(
            'UPDATE presentes SET categoria_id = ?, nome = ?, descricao = ?, valor_estimado = ?, url_compra = ?, imagem_url = ?, status = ? WHERE id = ?',
            [categoria_id, nome, descricao, valor_estimado, url_compra, imagem_url, status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Presente não encontrado.' });
        }
        res.status(200).json({ message: 'Presente atualizado com sucesso!' });
    } catch (error) {
        next(error);
    }
};

// ADMIN - Deletar um presente
exports.deleteGift = async (req, res, next) => {
    const { id } = req.params;
    try {
        const [result] = await pool.execute('DELETE FROM presentes WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Presente não encontrado.' });
        }
        res.status(200).json({ message: 'Presente excluído com sucesso!' });
    } catch (error) {
        next(error);
    }
};