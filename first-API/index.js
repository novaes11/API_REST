const express = require('express');
const app = express();

// Body parser
app.use(express.json());

// Mock DB em memória
let filmes = [];

// GET /filmes -> Lista todos os resources
app.get('/filmes', (req, res) => {
    res.status(200).json(filmes);
});

// POST /filmes -> Cria novo filme
app.post('/filmes', (req, res) => {
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

    // Business logic: range de ano válido (cinema surgiu em 1888)
    const currentYear = new Date().getFullYear();
    if (ano < 1888 || ano > currentYear + 5) {
        return res.status(400).json({ erro: "Business rule violation: ano fora do range permitido." });
    }

    // Monta e insere o novo resource
    const novoFilme = {
        id: filmes.length ? filmes[filmes.length - 1].id + 1 : 1, // Auto-increment genérico
        titulo,
        diretor,
        ano,
        genero
    };

    filmes.push(novoFilme);

    // Retorna 201 Created com o DTO do recurso criado
    res.status(201).json({
        mensagem: "Resource created successfully",
        data: novoFilme
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[API] Server is running on port ${PORT}`);
});