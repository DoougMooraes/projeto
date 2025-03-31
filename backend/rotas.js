const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configuração do multer para upload de arquivos (ex.: banner do estabelecimento)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Pasta onde os arquivos serão armazenados
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define nome único para cada arquivo
    }
});
const upload = multer({ storage });

// Importa os controladores
const authControlador = require('./controllers/authController');
const estabelecimentoControlador = require('./controllers/estabelecimentoController');
const avaliacaoControlador = require('./controllers/avaliacaoController');

// Importa o middleware de autenticação
const { verificarToken } = require('./middleware');

// Rotas de autenticação
router.post('/cadastrar', authControlador.cadastrarUsuario);
router.post('/login', authControlador.loginUsuario);

// Rotas para estabelecimentos
// Cadastro com upload de banner
router.post('/estabelecimentos', upload.single('banner'), estabelecimentoControlador.cadastrarEstabelecimento);
// Listagem de estabelecimentos
router.get('/estabelecimentos', estabelecimentoControlador.listarEstabelecimentos);
// Obter detalhes de um estabelecimento específico
router.get('/estabelecimento/:id', estabelecimentoControlador.obterEstabelecimento);

// Rotas para avaliações
// Cadastro de avaliação protegido pelo middleware (somente usuários autenticados podem avaliar)
router.post('/avaliacao', verificarToken, avaliacaoControlador.cadastrarAvaliacao);

// Edição de avaliação (usuário somente pode editar a própria avaliação)
router.put('/avaliacao/:id', verificarToken, avaliacaoControlador.editarAvaliacao);

// Listagem de avaliações para um estabelecimento
router.get('/avaliacoes/:idEstabelecimento', avaliacaoControlador.listarAvaliacoes);

module.exports = router;
