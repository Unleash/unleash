import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { PlaygroundResultFeatureStrategyList } from './PlaygroundResultFeatureStrategyList';
import { vi } from 'vitest';

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
            'If environment was enabled and parent dependencies were satisfied, then this feature flag would be TRUE with strategies evaluated like so:',
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
            'If parent dependencies were satisfied, then this feature flag would be TRUE with strategies evaluated like so:',
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
            'If environment was enabled, then this feature flag would be TRUE with strategies evaluated like so:',
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
    {
        name: 'Has disabled strategies and is disabled in environment',
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
