// database.js
const Database = require('better-sqlite3'); // Corrigido: 'Databaase' para 'Database'

// criar/abrir banco de dados
const db = new Database('filmes.db');

// Ajustei a tabela para bater exatamente com o que seu index.js espera
const createTableSQL = `
    CREATE TABLE IF NOT EXISTS filmes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(100) NOT NULL,
        diretor VARCHAR(100) NOT NULL,
        ano INTEGER (4) NOT NULL,
        genero VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.exec(createTableSQL);

console.log('✅ Banco de dados conectado e tabela pronta!');

// Exportar para usar em outros arquivos
module.exports = db;