import path from 'path';
import zlib from 'zlib';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
    projectId: 'tc2qff',
    defaultCommandTimeout: 12000,
    screenshotOnRunFailure: true,
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    retries: {
        runMode: 1,
        openMode: 0,
    },
    e2e: {
        specPattern: '**/*.spec.ts',
        setupNodeEvents(on, _config) {
            on(
                'file:preprocessor',
                vitePreprocessor({
                    configFile: path.resolve('./vite.config.mts'),
                    mode: 'development',
                }),
            );
            on('task', {
                log(message) {
                    console.log(message);
                    return null;
                },
                // The flight recorder sends gzipped NDJSON; decode it back to an
                // array of events so a spec can assert on what was recorded.
                decodeRecorderBody(body: unknown) {
                    const buffer =
                        typeof body === 'string'
                            ? Buffer.from(body, 'latin1')
                            : Buffer.from((body as { data: number[] }).data);
                    return zlib
                        .gunzipSync(buffer)
                        .toString('utf8')
                        .trim()
                        .split('\n')
                        .map((line) => JSON.parse(line));
                },
            });
        },
    },
});
