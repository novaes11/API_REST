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

// PUT /filmes/:id -> Atualiza um filme existente integralmente
app.put('/filmes/:id', (req, res) => {
    // 1. Pega o ID da URL e converte para número
    const id = parseInt(req.params.id, 10);
    
    // 2. Busca o index do filme no array
    const index = filmes.findIndex(filme => filme.id === id);

    // 3. Se não encontrar, retorna 404 Not Found
    if (index === -1) {
        return res.status(404).json({ erro: "Resource not found. Filme não encontrado." });
    }

    const { titulo, diretor, ano, genero } = req.body;

    // 4. Validação de campos obrigatórios (O PUT substitui o recurso todo)
    if (!titulo || !diretor || !ano || !genero) {
        return res.status(400).json({ 
            erro: "Payload inválido. Missing required fields (titulo, diretor, ano, genero)." 
        });
    }

    // 5. Type checking rigoroso
    if (typeof titulo !== 'string' || 
        typeof diretor !== 'string' || 
        typeof genero !== 'string') {
        return res.status(400).json({ erro: "Type mismatch: titulo, diretor e genero devem ser string." });
    }

    if (typeof ano !== 'number') {
        return res.status(400).json({ erro: "Type mismatch: ano deve ser number." });
    }

    // 6. Business logic
    const currentYear = new Date().getFullYear();
    if (ano < 1888 || ano > currentYear + 5) {
        return res.status(400).json({ erro: "Business rule violation: ano fora do range permitido." });
    }

    // 7. Atualiza o resource no mock DB mantendo o mesmo ID
    filmes[index] = {
        id, // Mantém o ID original da URL
        titulo,
        diretor,
        ano,
        genero
    };

    // 8. Retorna 200 OK com o DTO atualizado
    res.status(200).json({
        mensagem: "Resource updated successfully",
        data: filmes[index]
    });
});

// DELETE /filmes/:id -> Deleta um filme existente
app.delete('/filmes/:id', (req, res) => {
    // 1. Pega o ID da URL e converte para número
    const id = parseInt(req.params.id, 10);

    // 2. Busca o index do filme
    const index = filmes.findIndex(filme => filme.id === id);

    // 3. Se não encontrar, retorna 404 Not Found
    if (index === -1) {
        return res.status(404).json({ erro: "Resource not found. Filme não encontrado." });
    }

    // 4. Remove o item do array usando splice
    filmes.splice(index, 1);

    // 5. Retorna 200 OK confirmando a deleção
    // Nota: Algumas APIs preferem retornar 204 No Content sem corpo de resposta via res.status(204).send()
    res.status(200).json({
        mensagem: "Resource deleted successfully"
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[API] Server is running on port ${PORT}`);
});