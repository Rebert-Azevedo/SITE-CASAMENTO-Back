const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const giftsRoutes = require('./routes/giftsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const guestsRoutes = require('./routes/guestsRoutes'); 
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/guests', guestsRoutes); 

app.get('/', (req, res) => {
    res.send('API do site de casamento está funcionando!');
});

app.use(errorHandler);

module.exports = app;
