import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        globalSetup: ['./src/test-setup.ts'],
        setupFiles: [
            './src/test/errorWithMessage.ts',
            './src/test/reset-cross-file-state.ts',
        ],
        reporters:
            process.env.GITHUB_ACTIONS === 'true'
                ? [
                      ['dot'],
                      [
                          'junit',
                          {
                              suiteName: 'Unleash Unit Tests',
                              outputFile: 'reports/jest-junit.xml',
                              classnameTemplate: '{filename} - {filepath}',
                          },
                      ],
                      ['github-actions'],
                  ]
                : [['default']],
        testTimeout: 30000,
        environment: 'node',
        coverage: {
            reportOnFailure: true,
            reporter: [
                ['json', { path: './coverage/coverage-final.json' }],
                ['json-summary', { path: './coverage/coverage-summary.json' }],
                ['cobertura'],
                ['lcov', { projectRoot: './src' }],
            ],
            provider: 'v8',
            exclude: [
                ...(configDefaults.coverage.exclude || []),
                'frontend/**',
                'src/test-setup.ts',
                'src/server-dev.ts',
                'src/server.ts',
                'src/migrator.ts',
                'src/test/**/*.ts',
                'docker/*.js',
                'src/**/fakes/*.ts',
                'scripts',
            ],
            reportsDirectory: './coverage',
        },
        silent: 'passed-only',
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    exclude: [
                        ...configDefaults.exclude,
                        'frontend/**',
                        'docker/index.js',
                        'dist/**',
                        'src/test/e2e/**',
                    ],
                    // Most of a test file's runtime is re-importing the module
                    // graph in an isolated registry. The harness cleans up
                    // process-global state at every file boundary (see
                    // src/test/reset-cross-file-state.ts), so files can safely
                    // share a registry and pay the import cost once per worker
                    // instead of once per file.
                    isolate: false,
                },
            },
            {
                extends: true,
                test: {
                    name: 'e2e',
                    include: ['src/test/e2e/**/*.test.ts'],
                    exclude: [...configDefaults.exclude, 'dist/**'],
                },
            },
        ],
    },
});
