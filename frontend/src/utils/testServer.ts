import { SetupServerApi, setupServer } from 'msw/node';
import { rest } from 'msw';

export const testServerSetup = (): SetupServerApi => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    return server;
};

export const testServerRoute = (
    server: SetupServerApi,
    path: string,
    json: object,
    method: 'get' | 'post' | 'put' | 'delete' = 'get'
) => {
    server.use(
        rest[method](path, (req, res, ctx) => {
            return res(ctx.json(json));
        })
    );
};
