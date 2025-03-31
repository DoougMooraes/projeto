/**
 * migrate.js - Script para criar as tabelas no banco de dados automaticamente.
 * Esse script conecta ao MySQL e executa os comandos SQL para criar as tabelas se elas ainda não existirem.
 */

require('dotenv').config();
const mysql = require('mysql2'); // Usando o mysql2, que suporta caching_sha2_password

// Cria a conexão com o banco de dados usando as variáveis do .env
const conexao = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Define os comandos SQL para criação das tabelas
const sqlUsuarios = `
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);`;

const sqlEstabelecimentos = `
CREATE TABLE IF NOT EXISTS estabelecimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    banner VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL
);`;

const sqlAvaliacoes = `
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_estabelecimento INT NOT NULL,
    estrelas INT NOT NULL,
    comentario TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_estabelecimento) REFERENCES estabelecimentos(id)
);`;

// Função para executar um comando SQL e retornar uma Promise
function executarSQL(sql) {
  return new Promise((resolve, reject) => {
    conexao.query(sql, (erro, resultado) => {
      if (erro) return reject(erro);
      resolve(resultado);
    });
  });
}

// Conecta no banco de dados e executa as migrações
conexao.connect(async (erro) => {
  if (erro) {
    console.error('Erro ao conectar no MySQL:', erro);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');

  try {
    console.log('Criando tabela de usuários...');
    await executarSQL(sqlUsuarios);
    console.log('Tabela "usuarios" criada ou já existente.');

    console.log('Criando tabela de estabelecimentos...');
    await executarSQL(sqlEstabelecimentos);
    console.log('Tabela "estabelecimentos" criada ou já existente.');

    console.log('Criando tabela de avaliações...');
    await executarSQL(sqlAvaliacoes);
    console.log('Tabela "avaliacoes" criada ou já existente.');

    console.log('Migração concluída com sucesso!');
  } catch (erro) {
    console.error('Erro durante a migração:', erro);
  } finally {
    conexao.end(); // Fecha a conexão
  }
});
