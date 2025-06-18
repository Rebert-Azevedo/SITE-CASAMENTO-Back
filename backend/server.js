const app = require('./src/app');
const { testDbConnection } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000; 

testDbConnection().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse: http://localhost:${PORT}`); 
    });
}).catch(err => {
    console.error('Falha ao iniciar o servidor:', err.message);
    process.exit(1);
});