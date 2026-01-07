import type {
    AdvancedPlaygroundRequestSchema,
    AdvancedPlaygroundResponseSchema,
    PlaygroundRequestSchema,
    PlaygroundResponseSchema,
    PlaygroundStrategySchema,
} from '../../openapi/index.js';
import type {
    AdvancedPlaygroundFeatureEvaluationResult,
    PlaygroundFeatureEvaluationResult,
} from './playground-service.js';

const buildStrategyLink = (
    project: string,
    feature: string,
    environment: string,
    strategyId: string,
): string =>
    `/projects/${project}/features/${feature}/strategies/edit?environmentId=${environment}&strategyId=${strategyId}`;

const addStrategyEditLink = (
    environmentId: string,
    projectId: string,
    featureName: string,
    strategy: Omit<PlaygroundStrategySchema, 'links'>,
): PlaygroundStrategySchema => {
    return {
        ...strategy,
        links: {
            edit: buildStrategyLink(
                projectId,
                featureName,
                environmentId,
                strategy.id,
            ),
        },
    };
};

export const advancedPlaygroundViewModel = (
    input: AdvancedPlaygroundRequestSchema,
    playgroundResult: AdvancedPlaygroundFeatureEvaluationResult[],
    invalidContextProperties?: string[],
): AdvancedPlaygroundResponseSchema => {
    const features = playgroundResult.map(({ environments, ...rest }) => {
        const transformedEnvironments = Object.entries(environments).map(
            ([envName, envFeatures]) => {
                const transformedFeatures = envFeatures.map(
                    ({
                        name,
                        strategies,
                        environment,
                        projectId,
                        ...featRest
                    }) => ({
                        ...featRest,
                        name,
                        environment,
                        projectId,
                        strategies: {
                            ...strategies,
                            data: strategies.data.map((strategy) =>
                                addStrategyEditLink(
                                    environment,
                                    projectId,
                                    name,
                                    strategy,
                                ),
                            ),
                        },
                    }),
                );
                return [envName, transformedFeatures];
            },
        );

        return {
            ...rest,
            environments: Object.fromEntries(transformedEnvironments),
        };
    });

    if (invalidContextProperties?.length) {
        return { features, input, warnings: { invalidContextProperties } };
    }

    return { features, input };
};

export const playgroundViewModel = (
    input: PlaygroundRequestSchema,
    playgroundResult: PlaygroundFeatureEvaluationResult[],
): PlaygroundResponseSchema => {
    const features = playgroundResult.map(
        ({ name, strategies, projectId, ...rest }) => ({
            ...rest,
            name,
            projectId,
            strategies: {
                ...strategies,
                data: strategies.data.map((strategy) =>
                    addStrategyEditLink(
                        input.environment,
                        projectId,
                        name,
                        strategy,
                    ),
                ),
            },
        }),
    );

    return { input, features };
};
