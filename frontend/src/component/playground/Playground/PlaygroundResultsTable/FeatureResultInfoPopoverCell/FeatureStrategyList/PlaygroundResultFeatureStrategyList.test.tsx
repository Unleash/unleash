import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import React from 'react';
import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { PlaygroundResultFeatureStrategyList } from './PlaygroundResultFeatureStrategyList';

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
                    {
                        name: 'default',
                        parameters: {},
                        result: {
                            enabled: 'unknown',
                            evaluationStatus: 'unevaluated',
                        },
                    },
                ],
            },
            isEnabledInCurrentEnvironment: false,
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
