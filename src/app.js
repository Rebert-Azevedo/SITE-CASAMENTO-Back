const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const giftsRoutes = require('./routes/giftsRoutes');
const rsvpRoutes = require('./routes/rsvpRoutes'); // NOVO: Importa as rotas de RSVP
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/rsvp', rsvpRoutes); // NOVO: Usa as rotas de RSVP
// Adicione outras rotas aqui conforme forem criadas:
// app.use('/api/guests', guestsRoutes);
// app.use('/api/config', configRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/album', albumRoutes);
// app.use('/api/messages', messagesRoutes);

app.get('/', (req, res) => {
    res.send('API do site de casamento está funcionando!');
});

app.use(errorHandler); // Middleware de tratamento de erros, sempre por último

module.exports = app;