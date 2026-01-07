import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        globalSetup: ['./src/test-setup.ts'],
        setupFiles: ['./src/test/errorWithMessage.ts'],
        reporters: process.env.GITHUB_ACTIONS
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
        exclude: [
            ...configDefaults.exclude,
            'website/**',
            'frontend/**',
            'docker/index.js',
            'dist/**',
        ],
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
                'website/**',
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
    },
});
