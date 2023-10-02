import { countCombinations } from './combinationCounter';
import {
    AdvancedPlaygroundEnvironmentFeatureSchema,
    AdvancedPlaygroundFeatureSchema,
} from 'openapi';
// @ts-expect-error no types available
import cartesian from 'cartesian';

const generateFeature = (
    context: Record<string, string>
): AdvancedPlaygroundEnvironmentFeatureSchema => ({
    isEnabled: false,
    isEnabledInCurrentEnvironment: true,
    variant: {
        name: 'disabled',
        enabled: false,
    },
    context: {
        appName: 'playground',
    },
    variants: [],
    name: 'default',
    environment: 'development',
    projectId: 'default',
    strategies: {
        result: false,
        data: [
            {
                name: 'default',
                id: '7b233aae-cbc4-45ea-ace2-4c78c8e7e760',
                disabled: false,
                parameters: {},
                result: {
                    enabled: false,
                    evaluationStatus: 'complete' as 'complete',
                },
                constraints: [
                    {
                        inverted: false,
                        values: ['k'],
                        operator: 'IN',
                        contextName: 'appName',
                        caseInsensitive: false,
                        result: false,
                    },
                ],
                segments: [],
                links: {
                    edit: '/projects/default/features/default/strategies/edit?environmentId=development&strategyId=7b233aae-cbc4-45ea-ace2-4c78c8e7e760',
                },
            },
        ],
    },
});

const generateInput = (
    featureCount: number,
    environments: string[],
    contextValues: { [key: string]: string[] }
): AdvancedPlaygroundFeatureSchema[] => {
    const cartesianContext = cartesian(contextValues);

    return Array.from(Array(featureCount)).map((_, i) => ({
        name: `feature-${i}`,
        projectId: 'default',
        environments: Object.fromEntries(
            environments.map(env => [
                env,
                cartesianContext.map(generateFeature),
            ])
        ),
    }));
};

it('counts the correct number of combinations', () => {
    const assertCount = (
        numberOfFeatures: number,
        envs: string[],
        context: { [k: string]: string[] }
    ) => {
        const totalCombinations =
            numberOfFeatures *
            envs.length *
            Object.values(context)
                .map(contextValues => contextValues.length)
                .reduce((total, n) => total + n);
        const input = generateInput(numberOfFeatures, envs, context);
        expect(countCombinations(input)).toEqual(totalCombinations);
    };

    assertCount(1, ['development'], { x: ['2'] });
    assertCount(10, ['development', 'production'], {
        x: ['1', '2'],
        y: ['x', 'abc'],
    });
    assertCount(5, ['development'], { x: ['1', '2'] });
});
