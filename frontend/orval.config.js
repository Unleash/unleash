/**
 * How to generate OpenAPI client
 *
 * For now we only use generated types (src/openapi/models).
 * We will use methods (src/openapi/apis) for new features soon.
 * 1. `yarn gen:api` to generate the client
 * 2. `rm -rf src/openapi/apis` to remove methods (! except if you want to use some of those)
 * 3. clean up `src/openapi/index.ts` imports
 */
module.exports = {
    unleashApi: {
        output: {
            mode: 'tags',
            workspace: 'src/openapi',
            target: 'apis',
            schemas: 'models',
            client: 'swr',
            prettier: true,
            clean: true,
            // mock: true,
            override: {
                mutator: {
                    path: './fetcher.ts',
                    name: 'fetcher',
                },
            },
        },
        input: {
            target:
                process.env.UNLEASH_OPENAPI_URL ||
                'http://localhost:4242/docs/openapi.json',
        },
        hooks: {
            afterAllFilesWrite: 'yarn fmt',
        },
    },
};
