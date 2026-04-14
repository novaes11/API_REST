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
