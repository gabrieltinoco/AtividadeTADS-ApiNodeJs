const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const dbConfig = require('./dbConfig');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json()); // Habilita o Express para entender JSON no body
app.use(cors()); // Habilita o CORS

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Produtos está no ar!');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});