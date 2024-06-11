import express from 'express';
import supertest from 'supertest';
import idNumberMiddleware from './id-number-middleware';

describe('idNumberMiddleware', () => {
    it('should pass when id is a valid integer', async () => {
        const app = express();
        app.use('/:id', idNumberMiddleware());
        app.get('/:id', (req, res) => {
            res.status(200).send('Valid ID');
        });

        await supertest(app)
            .get('/123')
            .expect(200)
            .expect((res) => {
                expect(res.text).toBe('Valid ID');
            });
    });
    it('should throw BadDataError when id is not a valid integer', async () => {
        const app = express();
        app.use('/:id', idNumberMiddleware());
        app.get('/:id', (req, res) => {
            res.status(200).send('This should not be executed');
        });

        const { body } = await supertest(app).get('/abc').expect(400);
        expect(body).toMatchObject({
            details: [{ message: 'ID should be an integer' }],
        });
    });
});
