import path from 'path';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
    projectId: 'tc2qff',
    defaultCommandTimeout: 12000,
    screenshotOnRunFailure: false,
    video: false,
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
            });
        },
    },
});
