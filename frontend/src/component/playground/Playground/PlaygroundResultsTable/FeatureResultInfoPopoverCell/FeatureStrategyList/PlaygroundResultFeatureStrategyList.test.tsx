import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { PlaygroundResultFeatureStrategyList } from './PlaygroundResultsFeatureStrategyList.tsx';

const testCases = [
    {
        name: 'Environment not enabled and parent dependency not satisfied',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc82',
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
            'If the environment was enabled and parent dependencies were satisfied, then this feature flag would be TRUE with strategies evaluated like this:',
    },
    {
        name: 'Environment enabled and parent dependency not satisfied',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc83',
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
            'If parent dependencies were satisfied, then this feature flag would be TRUE with strategies evaluated like this:',
    },
    {
        name: 'Environment not enabled and parent dependency satisfied',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc77',
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
            'If the environment was enabled, then this feature flag would be TRUE with strategies evaluated like this:',
    },
    {
        name: 'Has disabled strategies and is enabled in environment',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc78',
                        name: 'default',
                        parameters: {},
                        result: { enabled: true, evaluationStatus: 'complete' },
                    },
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc79',
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
    {
        name: 'Has disabled strategies and is disabled in environment',
        feature: {
            strategies: {
                result: true,
                data: [
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc80',
                        name: 'default',
                        parameters: {},
                        result: { enabled: true, evaluationStatus: 'complete' },
                    },
                    {
                        id: 'f17532c8-4b36-4406-a23f-3db75e0adc81',
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
            isEnabledInCurrentEnvironment: false,
            hasUnsatisfiedDependency: false,
        } as PlaygroundFeatureSchema,
        expectedText:
            'Disabled strategies are not evaluated for the overall result.',
    },
];

vi.mock('../../../../../../hooks/useUiFlag', () => ({
    useUiFlag: vi.fn().mockImplementation(() => true),
}));

afterAll(() => {
    vi.clearAllMocks();
});

testCases.forEach(({ name, feature, expectedText }) => {
    test(`${name} (legacy)`, async () => {
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
