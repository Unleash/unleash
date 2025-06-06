/**
 * How to generate OpenAPI client
 *
 * For now we only use generated types (src/openapi/models).
 * Run `yarn gen:api` to generate the client.
 * We may use methods (src/openapi/apis) for new features in the future.
 */
import { defineConfig } from 'orval';

export default defineConfig({
    unleashApi: {
        output: {
            mode: 'tags',
            workspace: 'src/openapi',
            target: 'apis',
            schemas: 'models',
            client: 'swr',
            clean: true,
            propertySortOrder: 'Alphabetical',
            // mock: true,
            override: {
                mutator: {
                    path: './fetcher.ts',
                    name: 'fetcher',
                },
                header: () => [
                    'Generated by Orval',
                    'Do not edit manually.',
                    'See `gen:api` script in package.json',
                ],
            },
        },
        input: {
            target:
                process.env.UNLEASH_OPENAPI_URL ||
                'http://localhost:4242/docs/openapi.json',
        },
        hooks: {
            afterAllFilesWrite: './scripts/clean_orval_generated.sh',
        },
    },
});
