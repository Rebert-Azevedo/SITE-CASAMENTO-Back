const { pool } = require('../config/db');

// CONVIDADOS - Enviar/Atualizar RSVP
exports.submitRsvp = async (req, res, next) => {
    const { nome_completo, email, vai_participar, quantidade_criancas, observacoes } = req.body; // <-- AQUI

    if (!nome_completo || !email || vai_participar === undefined) {
        return res.status(400).json({ message: 'Nome, e-mail e confirmação de participação são obrigatórios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let [guests] = await connection.execute('SELECT id FROM convidados WHERE email = ?', [email]);
        let convidado_id;

        if (guests.length > 0) {
            convidado_id = guests[0].id;
            await connection.execute('UPDATE convidados SET nome_completo = ?, confirmado_presenca = ? WHERE id = ?', [nome_completo, vai_participar, convidado_id]);
        } else {
            const [result] = await connection.execute('INSERT INTO convidados (nome_completo, email, confirmado_presenca) VALUES (?, ?, ?)', [nome_completo, email, vai_participar]);
            convidado_id = result.insertId;
        }

        const [existingRsvp] = await connection.execute('SELECT id FROM rsvp WHERE convidado_id = ?', [convidado_id]);

        if (existingRsvp.length > 0) {
            await connection.execute(
                // Alterado: de quantidade_acompanhantes para quantidade_criancas
                'UPDATE rsvp SET quantidade_criancas = ?, vai_participar = ?, observacoes = ?, data_resposta = CURRENT_TIMESTAMP WHERE convidado_id = ?',
                [quantidade_criancas, vai_participar, observacoes, convidado_id]
            );
        } else {
            await connection.execute(
                // Alterado: de quantidade_acompanhantes para quantidade_criancas
                'INSERT INTO rsvp (convidado_id, quantidade_criancas, vai_participar, observacoes) VALUES (?, ?, ?, ?)',
                [convidado_id, quantidade_criancas, vai_participar, observacoes]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'RSVP registrado com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// ADMIN - Obter todos os RSVPs com detalhes do convidado
exports.getAllRsvpsAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            `SELECT r.id AS rsvp_id, r.quantidade_criancas, r.vai_participar, r.observacoes, r.data_resposta,
                    c.id AS convidado_id, c.nome_completo, c.email, c.telefone, c.confirmado_presenca
             FROM rsvp r
             JOIN convidados c ON r.convidado_id = c.id
             ORDER BY r.data_resposta DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// ADMIN - Atualizar um RSVP (incluindo dados do convidado associado)
exports.updateRsvpAdmin = async (req, res, next) => {
    const { rsvp_id } = req.params;
    const { nome_completo, email, telefone, vai_participar, quantidade_criancas, observacoes, confirmado_presenca } = req.body; // <-- AQUI

    if (!nome_completo || !email || vai_participar === undefined) {
        return res.status(400).json({ message: 'Nome, e-mail e participação são obrigatórios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rsvpRows] = await connection.execute('SELECT convidado_id FROM rsvp WHERE id = ? FOR UPDATE', [rsvp_id]);
        if (rsvpRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'RSVP não encontrado.' });
        }
        const convidado_id = rsvpRows[0].convidado_id;

        await connection.execute(
            'UPDATE convidados SET nome_completo = ?, email = ?, telefone = ?, confirmado_presenca = ? WHERE id = ?',
            [nome_completo, email, telefone, confirmado_presenca, convidado_id]
        );

        await connection.execute(
            // Alterado: de quantidade_acompanhantes para quantidade_criancas
            'UPDATE rsvp SET quantidade_criancas = ?, vai_participar = ?, observacoes = ?, data_resposta = CURRENT_TIMESTAMP WHERE id = ?',
            [quantidade_criancas, vai_participar, observacoes, rsvp_id]
        );

        await connection.commit();
        res.status(200).json({ message: 'RSVP e dados do convidado atualizados com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// ADMIN - Deletar um RSVP (e o convidado associado, se for o último RSVP dele)
exports.deleteRsvpAdmin = async (req, res, next) => {
    const { rsvp_id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rsvpRows] = await connection.execute('SELECT convidado_id FROM rsvp WHERE id = ?', [rsvp_id]);
        if (rsvpRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'RSVP não encontrado.' });
        }
        const convidado_id = rsvpRows[0].convidado_id;

        // Deleta o RSVP
        await connection.execute('DELETE FROM rsvp WHERE id = ?', [rsvp_id]);

        // Opcional: Se o convidado_id não tiver mais RSVPs ou outras relações, pode ser deletado
        const [remainingRsvps] = await connection.execute('SELECT COUNT(*) AS count FROM rsvp WHERE convidado_id = ?', [convidado_id]);
        if (remainingRsvps[0].count === 0) {
             // Você pode adicionar mais verificações aqui se o convidado puder ter outras informações (ex: reservas de presente)
            await connection.execute('DELETE FROM convidados WHERE id = ?', [convidado_id]);
        }

        await connection.commit();
        res.status(200).json({ message: 'RSVP e convidado associado (se aplicável) excluídos com sucesso!' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};