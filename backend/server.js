const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rotas = require('./rotas');

const app = express();
const porta = 3000;

// Configura middlewares
app.use(cors()); // Permite requisições de outras origens
app.use(bodyParser.json()); // Interpreta requisições com JSON no corpo
app.use(bodyParser.urlencoded({ extended: true })); // Interpreta requisições com dados URL-encoded

// Define a rota base para a API
app.use('/api', rotas);

// Inicia o servidor na porta definida
app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});
