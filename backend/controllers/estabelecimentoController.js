const conexao = require('../db');

/**
 * Cadastro de estabelecimento.
 * Recebe dados do estabelecimento e, se houver, o banner enviado via upload.
 */
exports.cadastrarEstabelecimento = (req, res) => {
    const { nome, endereco, categoria, descricao } = req.body;
    // Se existir arquivo enviado, define o caminho; caso contrário, null
    const banner = req.file ? `/uploads/${req.file.filename}` : null;

    const query = 'INSERT INTO estabelecimentos (nome, endereco, categoria, descricao, banner) VALUES (?, ?, ?, ?, ?)';
    conexao.query(query, [nome, endereco, categoria, descricao, banner], (err, result) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao cadastrar estabelecimento' });
        res.status(201).json({ mensagem: 'Estabelecimento cadastrado com sucesso!', id: result.insertId });
    });
};

/**
 * Listagem de estabelecimentos.
 * Permite filtro por categoria e nome via query string.
 */
exports.listarEstabelecimentos = (req, res) => {
    const { categoria, nome } = req.query;
    let query = 'SELECT * FROM estabelecimentos WHERE 1=1';
    let params = [];

    if (categoria) {
        query += ' AND categoria = ?';
        params.push(categoria);
    }
    if (nome) {
        query += ' AND nome LIKE ?';
        params.push(`%${nome}%`);
    }
    conexao.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ mensagem: 'Erro ao buscar estabelecimentos' });
        res.json(results);
    });
};

/**
 * Obtenção dos detalhes de um estabelecimento.
 * Busca o estabelecimento pelo id fornecido na rota.
 */
exports.obterEstabelecimento = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM estabelecimentos WHERE id = ?';
    conexao.query(sql, [id], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao buscar estabelecimento.', erro });
        }
        if (resultados.length === 0) {
            return res.status(404).json({ mensagem: 'Estabelecimento não encontrado.' });
        }
        res.json(resultados[0]);
    });
};
