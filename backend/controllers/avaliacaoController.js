const conexao = require('../db');

/**
 * Cadastro de avaliação.
 * Utiliza o id do usuário autenticado (req.usuario.id) e dados enviados no corpo da requisição.
 */
exports.cadastrarAvaliacao = (req, res) => {
    // Obtém o id do usuário a partir do token (middleware de autenticação)
    const usuario_id = req.usuario.id;
    // Obtém id do estabelecimento, número de estrelas e comentário do corpo da requisição
    const { idEstabelecimento, estrelas, comentario } = req.body;

    // Verifica se o usuário já avaliou este estabelecimento
    const checkQuery = 'SELECT * FROM avaliacoes WHERE id_usuario = ? AND id_estabelecimento = ?';
    conexao.query(checkQuery, [usuario_id, idEstabelecimento], (err, results) => {
        if (err) {
            // Em caso de erro na consulta, retorna status 500
            return res.status(500).json({ mensagem: 'Erro no servidor', erro: err });
        }
        if (results.length > 0) {
            // Se já existir avaliação, impede nova avaliação
            return res.status(400).json({ mensagem: 'Você já avaliou este estabelecimento!' });
        }

        // Insere a nova avaliação na tabela
        const insertQuery = 'INSERT INTO avaliacoes (id_usuario, id_estabelecimento, estrelas, comentario) VALUES (?, ?, ?, ?)';
        conexao.query(insertQuery, [usuario_id, idEstabelecimento, estrelas, comentario], (err, result) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao registrar avaliação', erro: err });
            }
            // Retorna mensagem de sucesso e status 201 (criado)
            res.status(201).json({ mensagem: 'Avaliação registrada com sucesso!' });
        });
    });
};

/**
 * Listagem de avaliações de um estabelecimento.
 * Recebe o id do estabelecimento pelos parâmetros da URL e retorna as avaliações com o nome do usuário.
 */
exports.listarAvaliacoes = (req, res) => {
    // Extrai o id do estabelecimento dos parâmetros da rota
    const { idEstabelecimento } = req.params;
    // Query para obter avaliações junto com o nome do usuário que fez a avaliação
    const sql = `
        SELECT a.*, u.nome as nome_usuario 
        FROM avaliacoes a 
        JOIN usuarios u ON a.id_usuario = u.id 
        WHERE a.id_estabelecimento = ?`;
    
    conexao.query(sql, [idEstabelecimento], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ mensagem: 'Erro ao buscar avaliações.', erro });
        }
        res.json(resultados);
    });
};

/**
 * Edição de avaliação.
 * Permite ao usuário atualizar as estrelas e o comentário de sua avaliação.
 * O usuário só pode editar a avaliação se ela pertencer a ele.
 */
exports.editarAvaliacao = (req, res) => {
    // Obtém o id do usuário autenticado e o id da avaliação a ser editada
    const usuario_id = req.usuario.id;
    const avaliacaoId = req.params.id;
    // Obtém os novos valores para estrelas e comentário do corpo da requisição
    const { estrelas, comentario } = req.body;

    // Verifica se a avaliação existe e se pertence ao usuário autenticado
    const checkQuery = 'SELECT * FROM avaliacoes WHERE id = ? AND id_usuario = ?';
    conexao.query(checkQuery, [avaliacaoId, usuario_id], (err, results) => {
        if (err) {
            return res.status(500).json({ mensagem: 'Erro no servidor', erro: err });
        }
        if (results.length === 0) {
            // Se a avaliação não existir ou não pertencer ao usuário, retorna erro 404
            return res.status(404).json({ mensagem: 'Avaliação não encontrada ou acesso negado' });
        }

        // Se a avaliação foi encontrada e pertence ao usuário, atualiza os dados
        const updateQuery = 'UPDATE avaliacoes SET estrelas = ?, comentario = ? WHERE id = ? AND id_usuario = ?';
        conexao.query(updateQuery, [estrelas, comentario, avaliacaoId, usuario_id], (err, result) => {
            if (err) {
                return res.status(500).json({ mensagem: 'Erro ao atualizar avaliação', erro: err });
            }
            res.json({ mensagem: 'Avaliação atualizada com sucesso!' });
        });
    });
};
