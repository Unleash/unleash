import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { PlaygroundFeatureSchema, PlaygroundRequestSchema } from 'openapi';
import { FeatureDetails } from './FeatureDetails.tsx';

const testCases = [
    {
        name: 'Feature has unsatisfied parent dependency and feature environment is disabled',
        feature: {
            hasUnsatisfiedDependency: true,
            isEnabledInCurrentEnvironment: false,
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is False in development because/,
        expectedText2:
            'parent dependency is not satisfied and the environment is disabled',
    },
    {
        name: 'Feature has unsatisfied parent dependency',
        feature: {
            hasUnsatisfiedDependency: true,
            isEnabledInCurrentEnvironment: true,
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is False in development because/,
        expectedText2: 'parent dependency is not satisfied',
    },
    {
        name: 'Feature environment is disabled',
        feature: {
            hasUnsatisfiedDependency: false,
            isEnabledInCurrentEnvironment: false,
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is False in development because/,
        expectedText2: 'the environment is disabled',
    },
    {
        name: 'Feature environment is enabled',
        feature: {
            isEnabled: true,
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is True in development because/,
        expectedText2: 'at least one strategy is True',
    },
    {
        name: 'Feature has only custom strategies',
        feature: {
            isEnabledInCurrentEnvironment: true,
            strategies: {
                data: [{ name: 'custom' }],
            },
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is Unknown in development because/,
        expectedText2: 'no strategies could be fully evaluated',
    },
    {
        name: 'Feature has some custom strategies',
        feature: {
            isEnabledInCurrentEnvironment: true,
            strategies: {
                data: [{ name: 'custom' }, { name: 'default' }],
            },
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is Unknown in development because/,
        expectedText2: 'not all strategies could be fully evaluated',
    },
    {
        name: 'Feature has all strategies evaluating to false',
        feature: {
            isEnabledInCurrentEnvironment: true,
            strategies: {
                data: [{ name: 'default' }],
            },
        } as PlaygroundFeatureSchema,
        expectedText1: /This feature flag is False in development because/,
        expectedText2:
            'all strategies are either False or could not be fully evaluated',
    },
];

testCases.forEach(({ name, feature, expectedText1, expectedText2 }) => {
    test(`${name} (legacy)`, async () => {
        render(
            <FeatureDetails
                feature={feature}
                input={
                    { environment: 'development' } as PlaygroundRequestSchema
                }
                onClose={() => {}}
            />,
        );

        await screen.findByText(expectedText1);
        await screen.findByText(expectedText2);
    });
});

testCases.forEach(({ name, feature, expectedText1, expectedText2 }) => {
    test(name, async () => {
        render(
            <FeatureDetails
                feature={feature}
                input={
                    { environment: 'development' } as PlaygroundRequestSchema
                }
                onClose={() => {}}
            />,
        );

        await screen.findByText(expectedText1);
        await screen.findByText(expectedText2);
    });
});
