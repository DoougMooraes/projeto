/**
 * Configuração da conexão com o banco de dados MySQL (localhost).
 * As credenciais são lidas do arquivo .env.
 */
require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const mysql = require('mysql2'); // Utilizando o pacote mysql2

// Cria a conexão utilizando as variáveis definidas no .env, com fallback para localhost
const conexao = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sua_senha_local',
    database: process.env.DB_NAME || 'nome_banco_local',
    port: process.env.DB_PORT || 3306
});

// Conecta no banco de dados e exibe mensagem de status
conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar no MySQL:', erro);
        return;
    }
    console.log('Conectado ao MySQL com sucesso (localhost)!');
});

module.exports = conexao;
