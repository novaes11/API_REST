/**
 * @file index.js
 * @description Servidor principal da API Mock (em memória) para gerenciamento de Filmes.
 * Implementa rotas CRUD completas com validação de dados e tratamento de erros.
 */

const express = require('express');
const app = express();

// Middleware nativo do Express para converter o corpo das requisições (body) em JSON
app.use(express.json());

// Middleware nativo do Express para converter o corpo das requisições (body) em JSON
app.use(express.json());

// Mínimo 10 registros iniciais em memória (Mock). 
// Essa variável atua como o nosso "Banco de Dados" enquanto a aplicação estiver rodando.
let filmes = [
    { id: 1, titulo: "O Poderoso Chefão", diretor: "Francis Ford Coppola", ano: 1972, genero: "Drama/Crime" },
    { id: 2, titulo: "Matrix", diretor: "Lana Wachowski, Lilly Wachowski", ano: 1999, genero: "Ficção Científica" },
    { id: 3, titulo: "Senhor dos Anéis: A Sociedade do Anel", diretor: "Peter Jackson", ano: 2001, genero: "Fantasia/Aventura" },
    { id: 4, titulo: "Pulp Fiction: Tempo de Violência", diretor: "Quentin Tarantino", ano: 1994, genero: "Crime/Drama" },
    { id: 5, titulo: "Interestelar", diretor: "Christopher Nolan", ano: 2014, genero: "Ficção Científica" },
    { id: 6, titulo: "Clube da Luta", diretor: "David Fincher", ano: 1999, genero: "Drama" },
    { id: 7, titulo: "A Origem", diretor: "Christopher Nolan", ano: 2010, genero: "Ficção Científica" },
    { id: 8, titulo: "Cidade de Deus", diretor: "Fernando Meirelles", ano: 2002, genero: "Crime/Drama" },
    { id: 9, titulo: "Vingadores: Ultimato", diretor: "Anthony Russo, Joe Russo", ano: 2019, genero: "Ação/Ficção Científica" },
    { id: 10, titulo: "O Cavaleiro das Trevas", diretor: "Christopher Nolan", ano: 2008, genero: "Ação/Policial" }
];

// Variável para simular o comportamento de AUTO_INCREMENT de um banco de dados real
let currentId = 11;

/**
 * Middleware de validação reutilizável.
 * Intercepta as requisições POST e PUT para garantir que os dados enviados (payload)
 * estão corretos antes de tentar salvar na "base de dados".
 * 
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função para passar o controle para a próxima etapa (a rota em si)
 */
function validarFilme(req, res, next) {
    const { titulo, diretor, ano, genero } = req.body;

    // 1. Validação de campos obrigatórios (Evita registros incompletos)
    if (!titulo || !diretor || !ano || !genero) {
        return res.status(400).json({ 
            erro: "Payload inválido. Os campos (titulo, diretor, ano, genero) são obrigatórios." 
        });
    }

    // 2. Validação de tipagem para campos de texto
    if (typeof titulo !== 'string' || typeof diretor !== 'string' || typeof genero !== 'string') {
        return res.status(400).json({ erro: "Tipo incorreto: titulo, diretor e genero devem ser texto (string)." });
    }

    // 3. Validação de tipagem para o campo numérico
    if (typeof ano !== 'number') {
        return res.status(400).json({ erro: "Tipo incorreto: ano deve ser numérico (number)." });
    }

    // 4. Validação de Regra de Negócio (O ano de lançamento deve fazer sentido historicamente)
    const anoAtual = new Date().getFullYear();
    if (ano < 1888 || ano > anoAtual + 5) {
        return res.status(400).json({ erro: `Regra de Negócio: O ano deve estar entre 1888 e ${anoAtual + 5}.` });
    }

    // Se passou por todas as validações sem retornar erro, avança para a rota principal
    next();
}

/**
 * 1. GET /filmes - Listar todos os filmes
 * Retorna a lista completa de objetos cadastrados no array (Mock DB).
 */
app.get('/filmes', (req, res) => {
    try {
        res.status(200).json(filmes);
    } catch (error) {
        res.status(500).json({ erro: "Erro interno do servidor ao buscar filmes." });
    }
});

/**
 * 2. GET /filmes/:id - Buscar filme por ID
 * Procura um filme específico na base utilizando o ID passado na URL.
 */
app.get('/filmes/:id', (req, res) => {
    try {
        // Converte o ID recebido da URL (que sempre vem como string) para número inteiro
        const id = parseInt(req.params.id, 10);
        const filme = filmes.find(f => f.id === id);

        // Se o método find() retornar undefined, significa que o ID não existe
        if (!filme) {
            return res.status(404).json({ erro: "Filme não encontrado." });
        }

        res.status(200).json(filme);
    } catch (error) {
        res.status(500).json({ erro: "Erro interno do servidor ao buscar o filme." });
    }
});

/**
 * 3. POST /filmes - Cadastrar um novo filme
 * Recebe um payload JSON, passa pelo middleware 'validarFilme',
 * atribui um novo ID e adiciona ao array.
 */
app.post('/filmes', validarFilme, (req, res) => {
    try {
        const { titulo, diretor, ano, genero } = req.body;
        
        const novoFilme = {
            id: currentId++,
            titulo,
            diretor,
            ano,
            genero
        };

        // Adiciona o novo objeto no final do nosso array (Mock DB)
        filmes.push(novoFilme);
        res.status(201).json({
            mensagem: "Filme cadastrado com sucesso!",
            data: novoFilme
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro interno do servidor ao cadastrar o filme." });
    }
});