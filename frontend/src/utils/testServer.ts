import { setupServer, SetupServer } from 'msw/node';
import { rest } from 'msw';

export const testServerSetup = (): SetupServer => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    return server;
};

export const testServerRoute = (
    server: SetupServer,
    path: string,
    json: object | boolean | string | number,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    status: number = 200,
) => {
    server.use(
        rest[method](path, (req, res, ctx) => {
            return res(ctx.status(status), ctx.json(json));
        }),
    );
};
