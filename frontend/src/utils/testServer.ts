import { setupServer, type SetupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

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
    server.use(http[method](path, () => HttpResponse.json(json, { status })));
};
