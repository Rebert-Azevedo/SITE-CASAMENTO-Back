const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306, // Adiciona essa linha
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sua_senha_do_mysql',
    database: process.env.DB_NAME || 'casamento_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados MySQL:', error.message);
        throw error; // Lança o erro para o server.js lidar
    }
}

module.exports = {
    pool,
    testDbConnection
};