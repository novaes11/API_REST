const express = require('express');
const db = require('./database'); // Importando o banco

const app = express();

// Body parser
app.use(express.json());

// GET /filmes/:id -> Retorna apenas UM filme pelo ID
app.get('/filmes/:id', (req, res) => {
    try{
    // Pegamos o ID que o usuário digitou na URL
    const id = parseInt(req.params.id, 10);

    // 1. Prepara a query com ?
    const stmt = db.prepare('SELECT * FROM filmes WHERE id = ?');
    
    // 2. Executa usando .get() passando o ID
    const filme = stmt.get(id); // Retorna 1 objeto inteiro ou 'undefined'

    // Se o banco não achou nada, retorna 404
    if (!filme) {
        return res.status(404).json({ erro: "Filme não encontrado." });
    }

    // Se achou, retorna o filme!
    res.status(200).json(filme);
    } catch(error) {
        console.error(error)
        res.status(500).json({error: 'Erro ao buscar filme'})
    }
});

// GET /api/produtos - Listar todos
app.get('/first-API/filmes', (req, res) => {
    try {
        // Preparar query
        const stmt = db.prepare('SELECT * FROM filmes');
        
        // Executar e pegar todos os resultados
        const filmes = stmt.all();
        
        // Retornar array (pode ser vazio [])
        res.json(filmes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar filmes' });
    }
});

// POST /filmes -> Cria novo filme
app.post('/filmes', (req, res) => {
    try {
        const { titulo, diretor, ano, genero } = req.body;

        // Validação de campos obrigatórios
        if (!titulo || !diretor || !ano || !genero) {
            return res.status(400).json({ 
                erro: "Payload inválido. Missing required fields (titulo, diretor, ano, genero)." 
            });
        }

        // Type checking rigoroso
        if (typeof titulo !== 'string' || 
            typeof diretor !== 'string' || 
            typeof genero !== 'string') {
            return res.status(400).json({ erro: "Type mismatch: titulo, diretor e genero devem ser string." });
        }

        if (typeof ano !== 'number') {
            return res.status(400).json({ erro: "Type mismatch: ano deve ser number." });
        }

        // Business logic
        const currentYear = new Date().getFullYear();
        if (ano < 1888 || ano > currentYear + 5) {
            return res.status(400).json({ erro: "Business rule violation: ano fora do range permitido." });
        }

        // 🔒 PROTEÇÃO SQL INJECTION AQUI: 
        // Usamos `?` no lugar dos valores. O better-sqlite3 sanitiza os dados automaticamente.
        const stmt = db.prepare(
            'INSERT INTO filmes (titulo, diretor, ano, genero) VALUES (?, ?, ?, ?)'
        );
        const info = stmt.run(titulo, diretor, ano, genero); // Passamos as variáveis aqui

        res.status(201).json({
            mensagem: "Resource created successfully",
            data: { id: info.lastInsertRowid, titulo, diretor, ano, genero }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error : 'Erro ao cirar produto'})
    }
});

// PUT /filmes/:id -> Atualiza um filme existente
app.put('/filmes/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { titulo, diretor, ano, genero } = req.body;

        if (!titulo || !diretor || !ano || !genero) {
            return res.status(400).json({ erro: "Missing required fields." });
        }

        // 🔒 PROTEÇÃO SQL INJECTION AQUI TAMBÉM:
        const stmt = db.prepare('UPDATE filmes SET titulo = ?, diretor = ?, ano = ?, genero = ? WHERE id = ?');
        const info = stmt.run(titulo, diretor, ano, genero, id); 

        // Se info.changes for 0, significa que nenhum ID correspondente foi encontrado
        if (info.changes === 0) {
            return res.status(404).json({ erro: "Resource not found. Filme não encontrado." });
        }

        res.status(200).json({
            mensagem: "Resource updated successfully",
            data: { id, titulo, diretor, ano, genero }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar filme'})
    }
});

// DELETE /filmes/:id -> Deleta um filme existente
app.delete('/filmes/:id', (req, res) => {
    try{
        const id = parseInt(req.params.id, 10);

        // 🔒 PROTEÇÃO SQL INJECTION:
        const stmt = db.prepare('DELETE FROM filmes WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return res.status(404).json({ erro: "Resource not found. Filme não encontrado." });
        }

        res.status(200).json({
            mensagem: "Resource deleted successfully"
        });
    } catch(error){
        console.error(error);
        res.status(500).json({ erro: 'Erro ao deletar produto'})
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[API] Server is running on port ${PORT}`);
});