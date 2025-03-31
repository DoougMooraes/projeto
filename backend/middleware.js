/**
 * Middleware para verificação de token JWT.
 */
const jwt = require('jsonwebtoken');
const chaveSecreta = 'minha_chave_secreta'; // Em produção, use variável de ambiente

// Middleware para verificar se o usuário está autenticado
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ mensagem: 'Acesso negado: token não fornecido.' });
    }
    jwt.verify(token, chaveSecreta, (erro, dados) => {
        if (erro) {
            return res.status(401).json({ mensagem: 'Token inválido.' });
        }
        req.usuario = dados;
        next();
    });
}

module.exports = { verificarToken, chaveSecreta };
