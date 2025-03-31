/**
 * Modelo da avaliação.
 * Estrutura da tabela 'avaliacoes':
 *   id                INT AUTO_INCREMENT PRIMARY KEY,
 *   id_usuario        INT,
 *   id_estabelecimento INT,
 *   estrelas          INT,
 *   comentario        TEXT,
 *   FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
 *   FOREIGN KEY (id_estabelecimento) REFERENCES estabelecimentos(id)
 */
