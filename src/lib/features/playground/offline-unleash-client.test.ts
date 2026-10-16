import { offlineUnleashClient } from './offline-unleash-client.js';
import { playgroundStrategyEvaluation } from '../../openapi/spec/playground-strategy-schema.js';

describe('offline client', () => {
    it('considers disabled features with a default strategy to be enabled', async () => {
        const name = 'toggle-name';
        const context = { appName: 'client-test' };
        const client = offlineUnleashClient({
            features: [
                {
                    strategies: [
                        {
                            name: 'default',
                        },
                    ],
                    project: 'default',
                    stale: false,
                    enabled: false,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            context,
        });

        const result = client.isEnabled(name, context);

        expect(result.result).toBe(true);
    });

    it(`returns '${playgroundStrategyEvaluation.unknownResult}' if it can't evaluate a feature`, async () => {
        const name = 'toggle-name';
        const context = { appName: 'client-test' };

        const client = offlineUnleashClient({
            features: [
                {
                    strategies: [
                        {
                            name: 'unimplemented-custom-strategy',
                            constraints: [],
                        },
                    ],
                    project: 'default',
                    stale: false,
                    enabled: true,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            context,
        });

        const result = client.isEnabled(name, context);

        result.strategies.forEach((strategy) => {
            expect(strategy.result.enabled).toEqual(
                playgroundStrategyEvaluation.unknownResult,
            );
        });
        expect(result.result).toEqual(
            playgroundStrategyEvaluation.unknownResult,
        );
    });

    it(`returns '${playgroundStrategyEvaluation.unknownResult}' for the application hostname strategy`, async () => {
        const name = 'toggle-name';
        const context = { appName: 'client-test' };

        const client = offlineUnleashClient({
            features: [
                {
                    strategies: [
                        {
                            name: 'applicationHostname',
                            constraints: [],
                        },
                    ],
                    project: 'default',
                    stale: false,
                    enabled: true,
                    name,
                    type: 'experiment',
                    variants: [],
                },
            ],
            context,
        });

        const result = client.isEnabled(name, context);

        result.strategies.forEach((strategy) => {
            expect(strategy.result.enabled).toEqual(
                playgroundStrategyEvaluation.unknownResult,
            );
        });
        expect(result.result).toEqual(
            playgroundStrategyEvaluation.unknownResult,
        );
    });

    it('returns strategies in the order they are provided', async () => {
        const featureName = 'featureName';
        const strategies = [
            {
                name: 'default',
                constraints: [],
                parameters: {},
            },
            {
                name: 'default',
                constraints: [
                    {
                        values: ['my-app-name'],
                        inverted: false,
                        operator: 'IN' as const,
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                ],
                parameters: {},
            },
            {
                name: 'applicationHostname',
                constraints: [],
                parameters: {
                    hostNames: 'myhostname.com',
                },
            },
            {
                name: 'flexibleRollout',
                constraints: [],
                parameters: {
                    groupId: 'killer',
                    rollout: '34',
                    stickiness: 'userId',
                },
            },
            {
                name: 'remoteAddress',
                constraints: [],
                parameters: {
                    IPs: '196.6.6.05',
                },
            },
        ];

        const context = { appName: 'client-test' };

        const client = offlineUnleashClient({
            features: [
                {
                    // @ts-expect-error: hostnames is incompatible with index signature | undefined is not assignable to type string
                    strategies,
                    // impressionData: false,
                    enabled: true,
                    name: featureName,
                    project: 'default',
                    // description: '',
                    // project: 'heartman-for-test',
                    stale: false,
                    type: 'kill-switch',
                    variants: [
                        {
                            name: 'a',
                            weight: 334,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                            payload: {
                                type: 'json',
                                value: '{"hello": "world"}',
                            },
                        },
                        {
                            name: 'b',
                            weight: 333,
                            weightType: 'variable',
                            stickiness: 'default',
                            overrides: [],
                            payload: {
                                type: 'string',
                                value: 'ueoau',
                            },
                        },
                        {
                            name: 'c',
                            weight: 333,
                            weightType: 'variable',
                            stickiness: 'default',
                            payload: {
                                type: 'csv',
                                value: '1,2,3',
                            },
                            overrides: [],
                        },
                    ],
                },
            ],
            context,
        });

        const evaluatedStrategies = client
            .isEnabled(featureName, context)
            .strategies.map((strategy) => strategy.name);

        expect(evaluatedStrategies).toEqual(
            strategies.map((strategy) => strategy.name),
        );
    });
});
