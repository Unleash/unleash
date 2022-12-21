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
