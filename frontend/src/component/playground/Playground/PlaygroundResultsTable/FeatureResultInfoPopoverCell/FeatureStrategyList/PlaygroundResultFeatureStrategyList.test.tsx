import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import React from 'react';
import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { PlaygroundResultFeatureStrategyList } from './PlaygroundResultFeatureStrategyList';
import {
    testServerRoute,
    testServerSetup,
} from 'utils/testServer';

const server = testServerSetup();
beforeEach(() => {
    testServerRoute(server, 'api/admin/ui-config', {
        environment: 'Open Source',
        flags: {
            playgroundImprovements: true,
        },
        slogan: 'getunleash.io - All rights reserved',
        name: 'Unleash enterprise',
        links: [
            {
                value: 'Documentation',
                icon: 'library_books',
                href: 'https://docs.getunleash.io/docs',
                title: 'User documentation',
            },
            {
                value: 'GitHub',
                icon: 'c_github',
                href: 'https://github.com/Unleash/unleash',
                title: 'Source code on GitHub',
            },
        ],
        version: '4.18.0-beta.5',
        emailEnabled: false,
        unleashUrl: 'http://localhost:4242',
        baseUriPath: '',
        authenticationType: 'enterprise',
        segmentValuesLimit: 100,
        strategySegmentsLimit: 5,
        frontendApiOrigins: ['*'],
        versionInfo: {
            current: { oss: '4.18.0-beta.5', enterprise: '4.17.0-beta.1' },
            latest: {},
            isLatest: true,
            instanceId: 'c7566052-15d7-4e09-9625-9c988e1f2be7',
        },
        disablePasswordAuth: false,
    });
});

const testCases = [
    {
        name: 'Environment not enabled and parent dependency not satisfied',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        name: 'default',
                        parameters: {},
                        result: { enabled: true, evaluationStatus: 'complete' },
                    },
                ],
            },
            isEnabledInCurrentEnvironment: false,
            hasUnsatisfiedDependency: true,
        } as PlaygroundFeatureSchema,
        expectedText:
            'If environment was enabled and parent dependencies were satisfied, then this feature toggle would be TRUE with strategies evaluated like so:',
    },
    {
        name: 'Environment enabled and parent dependency not satisfied',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        name: 'default',
                        parameters: {},
                        result: { enabled: true, evaluationStatus: 'complete' },
                    },
                ],
            },
            isEnabledInCurrentEnvironment: true,
            hasUnsatisfiedDependency: true,
        } as PlaygroundFeatureSchema,
        expectedText:
            'If parent dependencies were satisfied, then this feature toggle would be TRUE with strategies evaluated like so:',
    },
    {
        name: 'Environment not enabled and parent dependency satisfied',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        name: 'default',
                        parameters: {},
                        result: { enabled: true, evaluationStatus: 'complete' },
                    },
                ],
            },
            isEnabledInCurrentEnvironment: false,
            hasUnsatisfiedDependency: false,
        } as PlaygroundFeatureSchema,
        expectedText:
            'If environment was enabled, then this feature toggle would be TRUE with strategies evaluated like so:',
    },
    {
        name: 'Has disabled strategies and is enabled in environment',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        name: 'default',
                        parameters: {},
                        result: { enabled: true, evaluationStatus: 'complete' },
                    },
                    {
                        name: 'default',
                        parameters: {},
                        disabled: true,
                        result: {
                            enabled: 'unknown',
                            evaluationStatus: 'unevaluated',
                        },
                    },
                ],
            },
            isEnabledInCurrentEnvironment: true,
            hasUnsatisfiedDependency: false,
        } as PlaygroundFeatureSchema,
        expectedText:
            'Disabled strategies are not evaluated for the overall result.',
    },
];

testCases.forEach(({ name, feature, expectedText }) => {
    test(name, async () => {
        render(
            <PlaygroundResultFeatureStrategyList
                feature={feature}
                input={
                    { environment: 'development' } as PlaygroundRequestSchema
                }
            />,
        );

        await screen.findByText(expectedText);
    });
});
