CREATE DATABASE IF NOT EXISTS sistema_biblioteca
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_biblioteca;



CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    isbn VARCHAR(30) NOT NULL UNIQUE,
    status ENUM('Disponível', 'Emprestado')
        NOT NULL DEFAULT 'Disponível',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    usuario_id INT NULL,
    nome_leitor VARCHAR(100) NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_devolucao DATE NOT NULL,
    data_devolucao_real DATE NULL,
    status ENUM('Emprestado', 'Devolvido')
        NOT NULL DEFAULT 'Emprestado',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emprestimo_livro
        FOREIGN KEY (livro_id)
        REFERENCES livros(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_emprestimo_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);



CREATE INDEX idx_livros_titulo
    ON livros(titulo);

CREATE INDEX idx_emprestimos_status
    ON emprestimos(status);

CREATE INDEX idx_emprestimos_data
    ON emprestimos(data_devolucao);



INSERT IGNORE INTO livros (titulo, autor, isbn)
VALUES
    ('Dom Casmurro', 'Machado de Assis', 'LIVRO-001'),
    ('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'LIVRO-002'),
    ('A Moreninha', 'Joaquim Manuel de Macedo', 'LIVRO-003');


