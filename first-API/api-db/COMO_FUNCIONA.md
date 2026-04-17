# 🧠 Como a API Funciona (Arquitetura e Fluxo)

Se você quer entender exatamente o que acontece por debaixo dos panos nesta API, este é o guia definitivo. Vamos detalhar o ciclo de vida da aplicação usando uma analogia simples e depois olhar para o código.

## 🍽️ A Analogia do Restaurante
Imagine que a sua API é um restaurante de luxo:
* **Servidor (Express):** É o prédio do restaurante, que fica aberto com as portas destrancadas escutando os clientes (Porta 3000).
* **Banco de Dados (SQLite):** É a despensa de ingredientes, onde tudo fica guardado em segurança.
* **Rotas GET (Cardápio):** Área pública. Qualquer pessoa que passa na rua pode olhar o que tem.
* **Rotas POST/PUT/DELETE (Cozinha):** Área restrita. Apenas pessoas autorizadas podem entrar e modificar as coisas.
* **Middleware JWT:** É o segurança fortão que fica na porta da cozinha exigindo o crachá de funcionário (Token).

---

## ⚙️ O Fluxo Passo a Passo

### Passo 1: O "Despertar" do Servidor (Inicialização)
Quando você digita `npm run dev`, o Node.js acorda e começa a ler o arquivo `index.js` de cima para baixo.
1. Ele logo vê que precisa do `database.js` e vai até lá.
2. O `database.js` abre a "despensa" (cria o arquivo `filmes.db`).
3. Ele verifica: *"A despensa está vazia?"* (`SELECT COUNT(*) FROM filmes`).
4. Se estiver vazia, ele ativa o nosso **Seed Automático** e insere de uma vez 5 estúdios e 20 filmes para você não ter que começar do zero.
5. De volta ao `index.js`, o Express abre as portas (`app.listen(3000)`) e fica aguardando pedidos.

### Passo 2: O Cliente faz um Pedido (Requisição Pública)
O usuário abre o Postman e pede: `GET /first-API/filmes?genero=Ação&page=1`
1. A requisição bate no Express.
2. O Express percebe que é uma rota pública e deixa passar direto.
3. O código extrai as preferências do usuário (`req.query.genero`, `req.query.page`).
4. O código monta uma frase em SQL (A linguagem que o banco entende). Graças ao **LEFT JOIN**, a frase diz: *"Busque os filmes de ação da página 1 e junte com o nome do estúdio correspondente"*.
5. O banco devolve a lista e o Express entrega para o usuário com o selo verde de **Status 200 OK**.

### Passo 3: Criando o Crachá (Login JWT)
Para tentar apagar ou criar um filme, o cliente precisa se provar digno.
1. Ele envia um `POST /login` com `usuario` e `senha`.
2. O servidor checa os dados. Se baterem, ele usa a biblioteca `jsonwebtoken` e uma Palavra-Chave Secreta (`SECRET_KEY`) para assinar um **Token**.
3. Esse token tem um prazo de validade (1 hora) e é devolvido ao cliente.

### Passo 4: Modificando Dados (Requisição Protegida)
O usuário quer deletar o filme de ID 5. Ele envia: `DELETE /filmes/5` enviando o Token no cabeçalho da requisição.
Aqui entra o fluxo completo de segurança:

#### A) O Segurança (`verifyJWT`)
Antes do código de deletar rodar, o servidor aciona o middleware `verifyJWT`.
Ele pega o token, confere a assinatura digital e a validade. 
* **Deu ruim?** Ele bloqueia tudo na hora com um erro `401` ou `403`.
* **Deu bom?** Ele diz `next()` (pode entrar na cozinha!).

#### B) A Validação (Defesa da Aplicação)
*(No caso do POST/PUT)* O código checa se o usuário enviou os campos corretamente:
* Se faltou algo, devolve erro `400 Bad Request`.
* Se tentou enviar o ano como texto (`"2024"`) em vez de número, devolve `400`.
* Se tentou cadastrar um filme do ano de 1500 (Regra de Negócio), devolve `400`.

#### C) O Banco de Dados Seguro (Prepared Statements)
Na hora de falar com o SQLite, o código **nunca** confia cegamente no que o cliente digitou.
Ele usa a estrutura com pontos de interrogação `?`:
```javascript
db.prepare('DELETE FROM filmes WHERE id = ?').run(id);
```
Isso evita o famoso ataque de **SQL Injection**, onde um hacker digita um código malicioso no lugar do ID para tentar apagar todo o seu banco. A biblioteca substitui o `?` com total segurança.

#### D) A Resposta Final
O banco de dados confirma que deletou a linha.
O servidor devolve para o cliente:
```json
{
    "mensagem": "Resource deleted successfully"
}
```
Com um glorioso **Status 200 OK**.

---

## 📚 Resumo das Tecnologias
* **Express.js:** O maestro que organiza as rotas (URLs) e recebe/envia as respostas em JSON.
* **Better-SQLite3:** A biblioteca síncrona e incrivelmente rápida para conversar com o arquivo de banco de dados (`filmes.db`).
* **JSONWebToken (JWT):** O sistema de geração e verificação de tokens criptografados.
* **Jest e Supertest:** As bibliotecas que simulam requisições e testam toda a API em milissegundos, garantindo que nenhum código novo quebre o que já está funcionando.

**Com essa estrutura, a API é veloz, protegida contra invasores e super fácil de escalar!**