# 🎬 API REST de Filmes (SQLite + JWT)

Esta é uma API RESTful robusta desenvolvida em Node.js com Express para o gerenciamento de um catálogo de filmes. Diferente da versão Mock, esta API utiliza um banco de dados relacional real (**SQLite**), implementa sistema de segurança com **JWT** e traz recursos avançados como paginação e relacionamentos.

👉 **Quer entender o fluxo interno da API passo a passo? [Leia o guia COMO FUNCIONA](./COMO_FUNCIONA.md)**

---

## 🌐 API Online (Deploy na Nuvem)
Não quer rodar o projeto localmente? A API está hospedada e rodando 24/7 na nuvem! Você pode testar todos os endpoints diretamente pelo link abaixo:

**URL Base:** `https://api-rest-yhjx.onrender.com/first-API/api-db`

Basta utilizar este link no lugar do `http://localhost:3000` na hora de fazer as suas requisições no Postman ou no navegador.

---

## ✅ Funcionalidades Implementadas
- **[x] CRUD 100% com SQLite:** Banco de dados integrado utilizando `better-sqlite3`.
- **[x] Mínimo 20 registros:** Script de Seed automático que popula o banco com 5 estúdios e 20 filmes na primeira execução.
- **[x] Relacionamentos (JOINs):** Estrutura de chaves estrangeiras (`estudio_id`) relacionando a tabela `filmes` com a tabela `estudios`.
- **[x] Autenticação JWT:** Proteção rigorosa das rotas de modificação de dados.
- **[x] Filtros, ordenação, paginação:** Rota de listagem dinâmica aceitando Query Params.
- **[x] Validações robustas:** Proteção contra SQL Injection (`Prepared Statements`) e checagem de regras de negócio/tipagem.
- **[x] Status codes corretos:** Retornos claros (`200`, `201`, `400`, `401`, `403`, `404`, `500`).

---

## 🧪 Rodando os Testes Automatizados
A API possui uma suíte de testes de integração configurada com **Jest** e **Supertest**. Para validar se todas as rotas e bloqueios de segurança estão funcionando, basta rodar:
```bash
npm test
```
---

## 🚀 Como executar o projeto

1. Certifique-se de ter o Node.js instalado.
2. Acesse a pasta do projeto e instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
4. **Magia acontecendo:** Ao rodar o servidor pela primeira vez, o arquivo `filmes.db` será criado e o banco será automaticamente populado com os dados iniciais!
5. A API estará rodando em: `http://localhost:3000`

### Utilizando com o Postman
Para facilitar o uso, você pode importar as requisições prontas no seu Postman:
1. Abra o Postman e clique em **Import**.
2. Selecione o arquivo da *Collection* (formato `.json`) salvo nesta pasta.
3. Lembre-se de primeiro executar a requisição de **Login (POST)** para obter o Token JWT.
4. Cole o token na aba *Authorization -> Bearer Token* das requisições de POST, PUT e DELETE.

---

## 🔐 Autenticação (JWT)
As rotas de alteração de dados (POST, PUT, DELETE) estão protegidas. Para utilizá-las, você deve primeiro gerar um Token de Acesso.

### Gerar Token (Login)
* **Método:** `POST`
* **URL:** `/login`
* **Body da Requisição (JSON):**
  ```json
  {
      "usuario": "admin",
      "senha": "123456"
  }
  ```
* **Resposta:** Copie o valor do `"token"` gerado. No Postman, vá na aba **Authorization**, escolha o tipo **Bearer Token** e cole o token para testar as rotas protegidas.

---

## 📌 Documentação dos Endpoints

### 1. Listar Filmes (Com Paginação e Filtros) - 🔓 Público
* **Método:** `GET`
* **URL:** `/first-API/filmes`
* **Query Params Disponíveis (Opcionais):**
  * `page`: Número da página (Padrão: 1)
  * `limit`: Quantidade de itens por página (Padrão: 10)
  * `genero`: Filtra por gênero exato (Ex: `Ação`)
  * `sort`: Coluna para ordenação (`id`, `titulo`, `ano`, `genero`)
  * `order`: Direção da ordenação (`asc` ou `desc`)
* **Exemplo de URL:** `/first-API/filmes?page=2&limit=5&genero=Crime&sort=ano&order=desc`
* **Resposta de Sucesso:**
  ```json
  {
      "paginaAtual": 1,
      "itensPorPagina": 10,
      "quantidadeRetornada": 10,
      "dados": [
          {
              "id": 1,
              "titulo": "O Poderoso Chefão",
              "diretor": "Francis Ford Coppola",
              "ano": 1972,
              "genero": "Crime",
              "estudio_id": 1,
              "created_at": "2024-05-20 14:00:00",
              "updated_at": "2024-05-20 14:00:00",
              "estudio_nome": "Paramount Pictures"
          }
      ]
  }
  ```
  *(Nota: O campo `estudio_nome` é fruto do JOIN dinâmico no banco de dados).*

### 2. Buscar Filme por ID - 🔓 Público
* **Método:** `GET`
* **URL:** `/filmes/:id`

### 3. Cadastrar Filme - 🔒 Requer JWT
* **Método:** `POST`
* **URL:** `/filmes`
* **Body da Requisição:**
  ```json
  {
      "titulo": "Duna: Parte 2",
      "diretor": "Denis Villeneuve",
      "ano": 2024,
      "genero": "Ficção Científica",
      "estudio_id": 2
  }
  ```
* **Respostas de Erro Comuns:** 
  * `401 Unauthorized` (Token ausente)
  * `400 Bad Request` (Faltam campos ou o campo 'ano' viola a regra de negócio).

### 4. Atualizar Filme - 🔒 Requer JWT
* **Método:** `PUT`
* **URL:** `/filmes/:id`
* **Body da Requisição:** Aceita o mesmo formato do POST para atualização completa.

### 5. Deletar Filme - 🔒 Requer JWT
* **Método:** `DELETE`
* **URL:** `/filmes/:id`

---

## 🛡️ Validações e Segurança Implementadas

1. **Proteção contra SQL Injection:** Todas as queries utilizam `Prepared Statements` (os dados passam via `?`), delegando a sanitização para a biblioteca `better-sqlite3`.
2. **Proteção nas Query Params:** A ordenação (`sort`) checa o input contra um Array rígido de strings (`['id', 'titulo', 'ano', 'genero']`), impedindo que injetem comandos SQL na instrução `ORDER BY`.
3. **Autenticação:** O sistema valida a presença, formato e validade do Token JWT a cada requisição restrita, bloqueando acessos ilegítimos.
4. **Checagem de Regra de Negócio:** O ano de lançamento do filme deve estar compreendido entre o ano da invenção do cinema (1888) e os próximos 5 anos futuros em relação ao ano atual.
5. **Verificação de Chave Estrangeira:** O campo opcional `estudio_id` valida o tipo para numérico e é inserido de forma segura para relacionar as tabelas.