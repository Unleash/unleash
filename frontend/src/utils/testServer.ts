import { setupServer, type SetupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll } from 'vitest';

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
    searchParams?: Record<string, string>,
) => {
    const requests: unknown[] = [];
    server.use(
        http[method](path, async ({ request }) => {
            if (searchParams) {
                const url = new URL(request.url);
                const matches = Object.entries(searchParams).every(
                    ([key, value]) => url.searchParams.get(key) === value,
                );
                // Fall through to other handlers for this path when the
                // search params don't match.
                if (!matches) return undefined;
            }
            if (method === 'post' || method === 'put') {
                const body = await request.json().catch(() => undefined);
                if (body !== undefined) {
                    requests.push(body);
                }
            }
            return HttpResponse.json(json, { status });
        }),
    );
    return { requests };
};
