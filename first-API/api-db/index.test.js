const request = require('supertest');
const app = require('./index');

describe('Testes da API de Filmes', () => {
    let token = '';

    it('Deve listar os filmes na rota pública (GET /first-API/filmes)', async () => {
        const res = await request(app).get('/first-API/filmes');
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('dados');
        expect(Array.isArray(res.body.dados)).toBeTruthy();
    });

    it('Deve realizar o login e gerar um Token JWT (POST /login)', async () => {
        const res = await request(app)
            .post('/login')
            .send({
                usuario: 'admin',
                senha: '123456'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('auth', true);
        expect(res.body).toHaveProperty('token');
        
        // Guardando o token para usar nos próximos testes
        token = res.body.token;
    });

    it('Deve barrar a criação de um filme sem enviar o token (POST /filmes)', async () => {
        const res = await request(app)
            .post('/filmes')
            .send({
                titulo: 'Filme Invasor',
                diretor: 'Hacker',
                ano: 2024,
                genero: 'Ação'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('erro');
    });

    it('Deve criar um filme ao enviar o Token JWT válido (POST /filmes)', async () => {
        const res = await request(app)
            .post('/filmes')
            .set('Authorization', `Bearer ${token}`) // Usando o token guardado
            .send({
                titulo: 'Filme Autorizado Teste',
                diretor: 'Testador',
                ano: 2024,
                genero: 'Comédia'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.mensagem).toBe("Resource created successfully");
    });
});