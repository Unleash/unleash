import { setupServer, type SetupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const testServerSetup = (): SetupServer => {
    const server = setupServer();

    beforeAll(() =>
        server.listen({
            onUnhandledRequest() {
                return HttpResponse.error();
            },
        }),
    );
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
    const requests: unknown[] = [];
    server.use(
        http[method](path, async ({ request }) => {
            const body = await request.json().catch(() => undefined);
            requests.push(body);
            return HttpResponse.json(json, { status });
        }),
    );
    return { requests };
};
