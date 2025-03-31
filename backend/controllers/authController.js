const conexao = require('../db');
const jwt = require('jsonwebtoken');
const { chaveSecreta } = require('../middleware');

/**
 * Cadastro de usuário.
 * Recebe nome, email e senha do corpo da requisição e insere no banco.
 */
exports.cadastrarUsuario = (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Preencha todos os campos.' });
    }
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    conexao.query(sql, [nome, email, senha], (erro, resultado) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.', erro });
        }
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    });
};

/**
 * Login de usuário.
 * Verifica se as credenciais estão corretas e gera um token JWT.
 */
exports.loginUsuario = (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    conexao.query(query, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ mensagem: 'Erro no servidor' });
        if (results.length === 0) return res.status(401).json({ mensagem: 'Credenciais inválidas' });

        const user = results[0];
        // Gera um token com validade de 1 hora contendo o id e email do usuário
        const token = jwt.sign({ id: user.id, email: user.email }, chaveSecreta, { expiresIn: '1h' });
        res.json({ mensagem: 'Login bem-sucedido!', token });
    });
};
