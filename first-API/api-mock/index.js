/**
 * @file index.js
 * @description Servidor principal da API Mock (em memória) para gerenciamento de Filmes.
 * Implementa rotas CRUD completas com validação de dados e tratamento de erros.
 */

const express = require('express');
const app = express();

// Middleware nativo do Express para converter o corpo das requisições (body) em JSON
app.use(express.json());
