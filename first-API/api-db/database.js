// database.js
const Database = require('better-sqlite3'); // Corrigido: 'Databaase' para 'Database'

// criar/abrir banco de dados
const db = new Database('filmes.db');

// 1. Criar tabela de Estúdios (Para o Relacionamento / JOIN)
const createEstudiosSQL = `
    CREATE TABLE IF NOT EXISTS estudios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL
    )
`;
db.exec(createEstudiosSQL);

// Ajustei a tabela para bater exatamente com o que seu index.js espera
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS filmes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(100) NOT NULL,
        diretor VARCHAR(100) NOT NULL,
        ano INTEGER (4) NOT NULL,
        genero VARCHAR(50) NOT NULL,
        estudio_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estudio_id) REFERENCES estudios(id)
    )
`;

db.exec(createTableSQL);

console.log('✅ Banco de dados conectado e tabela pronta!');

// 2. Inserir 20 registros e estúdios automaticamente (SEED)
const checkFilmes = db.prepare('SELECT COUNT(*) AS count FROM filmes').get();

// Só insere os dados se a tabela estiver completamente vazia (count === 0)
if (checkFilmes.count === 0) {
    console.log('🌱 Banco vazio. Inserindo dados iniciais (Seed)...');
    
    // Inserindo Estúdios de exemplo
    const insertEstudio = db.prepare('INSERT INTO estudios (nome) VALUES (?)');
    insertEstudio.run('Paramount Pictures'); // Vai ser o ID 1
    insertEstudio.run('Warner Bros');        // Vai ser o ID 2
    insertEstudio.run('Miramax');            // Vai ser o ID 3
    insertEstudio.run('Walt Disney');        // Vai ser o ID 4
    insertEstudio.run('Universal Pictures'); // Vai ser o ID 5

    // Inserindo 20 Filmes
    const insertFilme = db.prepare('INSERT INTO filmes (titulo, diretor, ano, genero, estudio_id) VALUES (?, ?, ?, ?, ?)');
    const filmesDemo = [
        { titulo: 'O Poderoso Chefão', diretor: 'Francis Ford Coppola', ano: 1972, genero: 'Crime', estudio_id: 1 },
        { titulo: 'Matrix', diretor: 'Lana Wachowski', ano: 1999, genero: 'Ficção Científica', estudio_id: 2 },
        { titulo: 'Senhor dos Anéis', diretor: 'Peter Jackson', ano: 2001, genero: 'Fantasia', estudio_id: 2 },
        { titulo: 'Pulp Fiction', diretor: 'Quentin Tarantino', ano: 1994, genero: 'Crime', estudio_id: 3 },
        { titulo: 'Interestelar', diretor: 'Christopher Nolan', ano: 2014, genero: 'Ficção Científica', estudio_id: 2 },
        { titulo: 'Clube da Luta', diretor: 'David Fincher', ano: 1999, genero: 'Drama', estudio_id: 1 },
        { titulo: 'A Origem', diretor: 'Christopher Nolan', ano: 2010, genero: 'Ficção Científica', estudio_id: 2 },
        { titulo: 'Cidade de Deus', diretor: 'Fernando Meirelles', ano: 2002, genero: 'Crime', estudio_id: null },
        { titulo: 'Vingadores', diretor: 'Joss Whedon', ano: 2012, genero: 'Ação', estudio_id: 4 },
        { titulo: 'O Cavaleiro das Trevas', diretor: 'Christopher Nolan', ano: 2008, genero: 'Ação', estudio_id: 2 },
        { titulo: 'Forrest Gump', diretor: 'Robert Zemeckis', ano: 1994, genero: 'Drama', estudio_id: 1 },
        { titulo: 'Star Wars', diretor: 'George Lucas', ano: 1977, genero: 'Ficção Científica', estudio_id: 1 },
        { titulo: 'Gladiador', diretor: 'Ridley Scott', ano: 2000, genero: 'Ação', estudio_id: 5 },
        { titulo: 'De Volta para o Futuro', diretor: 'Robert Zemeckis', ano: 1985, genero: 'Ficção Científica', estudio_id: 5 },
        { titulo: 'O Exterminador do Futuro 2', diretor: 'James Cameron', ano: 1991, genero: 'Ação', estudio_id: null },
        { titulo: 'Jurassic Park', diretor: 'Steven Spielberg', ano: 1993, genero: 'Aventura', estudio_id: 5 },
        { titulo: 'O Rei Leão', diretor: 'Roger Allers', ano: 1994, genero: 'Animação', estudio_id: 4 },
        { titulo: 'Alien', diretor: 'Ridley Scott', ano: 1979, genero: 'Ficção Científica', estudio_id: 1 },
        { titulo: 'Indiana Jones', diretor: 'Steven Spielberg', ano: 1981, genero: 'Aventura', estudio_id: 1 },
        { titulo: 'Os Bons Companheiros', diretor: 'Martin Scorsese', ano: 1990, genero: 'Crime', estudio_id: 2 }
    ];
    
    // Usamos transaction para inserir todos de uma vez (é mais rápido e seguro)
    const insertMany = db.transaction((filmes) => {
        for (const f of filmes) {
            insertFilme.run(f.titulo, f.diretor, f.ano, f.genero, f.estudio_id);
        }
    });
    
    insertMany(filmesDemo);
    console.log('✅ 20 filmes e 5 estúdios inseridos com sucesso!');
}

// Exportar para usar em outros arquivos
module.exports = db;