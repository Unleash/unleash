import { setupServer, SetupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterEach, afterAll } from 'vitest';

function ensureLeadingSlash(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
}

export const testServerSetup = () => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    server.events.on('request:start', ({ request }) => {
        console.log(
            '--Request Start:',
            request.clone().method,
            request.clone().url,
        );
        console.log('--Handlers Including the path --');
        console.log(
            JSON.stringify(
                server
                    .listHandlers()
                    .filter((handler) =>
                        handler.info.header.includes(request.clone().url),
                    ),
            ),
        );
    });

    server.events.on('request:unhandled', ({ request }) => {
        console.log(
            '--Unhandled:',
            request.clone().method,
            request.clone().url,
        );
        console.log('--Handlers--');
        console.log(server.listHandlers());
    });

    server.events.on('response:mocked', ({ response }) => {
        console.log('Mocked:', response.clone().json());
    });

    server.events.on('response:bypass', ({ response }) => {
        console.log('Bypassed:', response.clone().json());
    });
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
        http[method](ensureLeadingSlash(path), ({ request }) => {
            console.log('Handler', request.method, request.url);
            return HttpResponse.json(json, { status });
        }),
    );
};
