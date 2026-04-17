const express = require('express');
const db = require('./database'); // Importando o banco
const jwt = require('jsonwebtoken'); // Importando o JWT

const app = express();
const SECRET_KEY = 'minha_chave_secreta_faculdade'; // Em produção, use variáveis de ambiente (.env)!

// Body parser
app.use(express.json());

// Rota de Login para gerar o Token JWT
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    
    // Mock de usuário (Hardcoded para estudo). Em um projeto real, você buscaria no banco de dados.
    if (usuario === 'admin' && senha === '123456') {
        // Gera o token com validade de 1 hora
        const token = jwt.sign({ userId: 1, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ auth: true, token });
    }
    
    res.status(401).json({ auth: false, erro: 'Credenciais inválidas!' });
});

// Middleware para verificar o Token JWT nas rotas protegidas
function verifyJWT(req, res, next) {
    const tokenHeader = req.headers['authorization'];
    if (!tokenHeader) return res.status(401).json({ auth: false, erro: 'Nenhum token fornecido.' });
    
    // O token geralmente vem no formato "Bearer <token>", então separamos pelo espaço
    const token = tokenHeader.split(' ')[1] || tokenHeader;
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ auth: false, erro: 'Falha ao autenticar o token (pode estar expirado ou incorreto).' });
        
        // Se tudo estiver ok, salva o ID do usuário na request para uso futuro e avança
        req.userId = decoded.userId;
        next();
    });
}

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

// GET /first-API/filmes - Listar todos (Com Filtros, Ordenação, Paginação e JOIN)
app.get('/first-API/filmes', (req, res) => {
    try {
        // 1. Recebendo parâmetros da URL (Query Params) com valores padrão
        const limit = parseInt(req.query.limit) || 10;     // Quantos itens por página? (Padrão: 10)
        const page = parseInt(req.query.page) || 1;        // Qual página? (Padrão: 1)
        const offset = (page - 1) * limit;                 // Cálculo matemático para pular registros
        
        const genero = req.query.genero;                   // Ex: /filmes?genero=Ação
        const sort = req.query.sort || 'id';               // Qual coluna ordenar? (Padrão: id)
        const order = req.query.order === 'desc' ? 'DESC' : 'ASC'; // Crescente ou decrescente?

        // 🔒 Validação de segurança (Evita que digitem comandos maliciosos na ordenação)
        const colunasValidas = ['id', 'titulo', 'ano', 'genero'];
        const colunaOrdenacao = colunasValidas.includes(sort) ? sort : 'id';

        // 2. Construindo a query SQL base (Usando LEFT JOIN para trazer o nome do estúdio)
        let sql = `
            SELECT filmes.*, estudios.nome AS estudio_nome 
            FROM filmes 
            LEFT JOIN estudios ON filmes.estudio_id = estudios.id
        `;
        const params = []; // Array que vai guardar os valores seguros dos filtros

        // 3. Aplicando Filtros dinamicamente (WHERE)
        if (genero) {
            sql += ` WHERE filmes.genero = ?`; // Adiciona o filtro na string do SQL
            params.push(genero);               // Guarda o valor para substituir o '?'
        }

        // 4. Aplicando Ordenação e Paginação (ORDER BY, LIMIT, OFFSET)
        sql += ` ORDER BY filmes.${colunaOrdenacao} ${order}`;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset); // Limite de itens e quantos itens pular

        // 5. Preparar e Executar
        const stmt = db.prepare(sql);
        const filmes = stmt.all(...params); // Os ... (spread) abrem o array e passam os valores ordenados
        
        // 6. Resposta estruturada para ajudar quem consumir a API
        res.json({
            paginaAtual: page,
            itensPorPagina: limit,
            quantidadeRetornada: filmes.length,
            dados: filmes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar filmes' });
    }
});

// POST /filmes -> Cria novo filme
app.post('/filmes', verifyJWT, (req, res) => {
    try {
        const { titulo, diretor, ano, genero, estudio_id } = req.body;

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
        
        if (estudio_id !== undefined && typeof estudio_id !== 'number') {
            return res.status(400).json({ erro: "Type mismatch: estudio_id deve ser number." });
        }

        // Business logic
        const currentYear = new Date().getFullYear();
        if (ano < 1888 || ano > currentYear + 5) {
            return res.status(400).json({ erro: "Business rule violation: ano fora do range permitido." });
        }

        // 🔒 PROTEÇÃO SQL INJECTION AQUI: 
        // Usamos `?` no lugar dos valores. O better-sqlite3 sanitiza os dados automaticamente.
        const stmt = db.prepare(
            'INSERT INTO filmes (titulo, diretor, ano, genero, estudio_id) VALUES (?, ?, ?, ?, ?)'
        );
        const info = stmt.run(titulo, diretor, ano, genero, estudio_id || null); // Passamos as variáveis aqui

        res.status(201).json({
            mensagem: "Resource created successfully",
            data: { id: info.lastInsertRowid, titulo, diretor, ano, genero, estudio_id: estudio_id || null }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error : 'Erro ao cirar produto'})
    }
});

// PUT /filmes/:id -> Atualiza um filme existente
app.put('/filmes/:id', verifyJWT, (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { titulo, diretor, ano, genero, estudio_id } = req.body;

        if (!titulo || !diretor || !ano || !genero) {
            return res.status(400).json({ erro: "Missing required fields." });
        }
        
        if (estudio_id !== undefined && typeof estudio_id !== 'number') {
            return res.status(400).json({ erro: "Type mismatch: estudio_id deve ser number." });
        }

        // 🔒 PROTEÇÃO SQL INJECTION AQUI TAMBÉM:
        const stmt = db.prepare('UPDATE filmes SET titulo = ?, diretor = ?, ano = ?, genero = ?, estudio_id = ? WHERE id = ?');
        const info = stmt.run(titulo, diretor, ano, genero, estudio_id || null, id); 

        // Se info.changes for 0, significa que nenhum ID correspondente foi encontrado
        if (info.changes === 0) {
            return res.status(404).json({ erro: "Resource not found. Filme não encontrado." });
        }

        res.status(200).json({
            mensagem: "Resource updated successfully",
            data: { id, titulo, diretor, ano, genero, estudio_id: estudio_id || null }
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar filme'})
    }
});

// DELETE /filmes/:id -> Deleta um filme existente
app.delete('/filmes/:id', verifyJWT, (req, res) => {
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
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`[API] Server is running on port ${PORT}`);
    });
}

// Exportando a aplicação para o Supertest utilizar
module.exports = app;