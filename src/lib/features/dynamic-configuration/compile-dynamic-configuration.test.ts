import { describe, expect, test } from 'vitest';
import { compileDynamicConfiguration } from './compile-dynamic-configuration.js';
import type { DynamicConfiguration } from './dynamic-configuration-types.js';

const configuration: DynamicConfiguration = {
    key: 'api_timeout_ms',
    project: 'payment-services',
    description: 'Payment provider timeout.',
    type: 'number',
    versions: [
        { version: 1, value: 5000, createdAt: '2026-06-08T10:00:00.000Z' },
        { version: 2, value: 2000, createdAt: '2026-06-08T10:00:00.000Z' },
        { version: 3, value: 3000, createdAt: '2026-06-08T10:00:00.000Z' },
    ],
    environments: {
        development: {
            defaultVersion: 1,
            overrides: [
                {
                    id: 'second',
                    priority: 2,
                    constraints: [
                        {
                            contextName: 'appName',
                            operator: 'IN',
                            values: ['worker'],
                        },
                    ],
                    version: 3,
                },
                {
                    id: 'first',
                    priority: 1,
                    constraints: [
                        {
                            contextName: 'appName',
                            operator: 'IN',
                            values: ['web-app'],
                        },
                    ],
                    version: 2,
                },
            ],
        },
    },
    createdAt: '2026-06-08T10:00:00.000Z',
    updatedAt: '2026-06-08T10:00:00.000Z',
};

describe('compileDynamicConfiguration', () => {
    test('compiles ordered overrides followed by a default catch-all rule', () => {
        expect(
            compileDynamicConfiguration(configuration, 'development'),
        ).toEqual({
            name: 'api_timeout_ms',
            project: 'payment-services',
            type: 'number',
            versions: [
                {
                    version: 1,
                    payload: {
                        type: 'number',
                        value: '5000',
                    },
                },
                {
                    version: 2,
                    payload: {
                        type: 'number',
                        value: '2000',
                    },
                },
                {
                    version: 3,
                    payload: {
                        type: 'number',
                        value: '3000',
                    },
                },
            ],
            rules: [
                {
                    expression: 'app_name in ["web-app"]',
                    version: 2,
                },
                {
                    expression: 'app_name in ["worker"]',
                    version: 3,
                },
                {
                    expression: 'true',
                    version: 1,
                },
            ],
        });
    });

    test('omits a configuration that has no value for the token environment', () => {
        expect(
            compileDynamicConfiguration(configuration, 'production'),
        ).toBeUndefined();
    });

    test('rejects selectors that reference a missing version', () => {
        const invalidConfiguration: DynamicConfiguration = {
            ...configuration,
            environments: {
                development: {
                    defaultVersion: 99,
                    overrides: [],
                },
            },
        };

        expect(() =>
            compileDynamicConfiguration(invalidConfiguration, 'development'),
        ).toThrow('references missing version 99');
    });

    test('rejects duplicate version numbers', () => {
        const invalidConfiguration: DynamicConfiguration = {
            ...configuration,
            versions: [
                ...configuration.versions,
                {
                    version: 1,
                    value: 6000,
                    createdAt: '2026-06-08T11:00:00.000Z',
                },
            ],
        };

        expect(() =>
            compileDynamicConfiguration(invalidConfiguration, 'development'),
        ).toThrow('contains duplicate versions');
    });
});
