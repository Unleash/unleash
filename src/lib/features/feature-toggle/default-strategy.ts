import type { IStrategyConfig } from '../../types/index.js';

export function getDefaultStrategy(featureName: string): IStrategyConfig {
    return {
        name: 'flexibleRollout',
        constraints: [],
        disabled: false,
        parameters: {
            rollout: '100',
            stickiness: 'default',
            groupId: featureName,
        },
    };
}

function resolveGroupId(
    defaultStrategy: IStrategyConfig,
    featureName: string,
): string {
    const groupId =
        defaultStrategy?.parameters?.groupId !== ''
            ? defaultStrategy.parameters?.groupId
            : featureName;

    return groupId || '';
}

export function getProjectDefaultStrategy(
    defaultStrategy: IStrategyConfig,
    featureName: string,
): IStrategyConfig {
    return {
        ...defaultStrategy,
        parameters: {
            ...defaultStrategy.parameters,
            groupId: resolveGroupId(defaultStrategy, featureName),
        },
    };
}
