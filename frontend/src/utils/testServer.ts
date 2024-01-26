import { SetupServer, setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

export const testServerSetup = (): SetupServer => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterAll(() => server.close());
    afterEach(() => server.resetHandlers());

    return server;
};

const handlerVerbs = {
    get: http.get,
    post: http.post,
    put: http.put,
    delete: http.delete,
};

export const testServerRoute = (
    server: SetupServer,
    path: string,
    json: object | boolean | string | number,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    status: number = 200,
) => {
    server.use(
        handlerVerbs[method](path, async ({ request }) => {
            console.log('Whee', path);
            const newPost = await request.json();
            console.log('I got the thing', newPost);
            return HttpResponse.json(newPost, { status });
        }),
    );
};
