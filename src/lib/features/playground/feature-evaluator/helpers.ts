import { IStrategyConfig } from '../../../types';
import { FeatureStrategiesEvaluationResult } from './client';
import { Context } from './context';

export type FallbackFunction = (name: string, context: Context) => boolean;

export function createFallbackFunction(
    name: string,
    context: Context,
    fallback?: FallbackFunction | boolean,
): () => FeatureStrategiesEvaluationResult {
    const createEvalResult = (enabled: boolean) => ({
        result: enabled,
        strategies: [],
    });

    if (typeof fallback === 'function') {
        return () => createEvalResult(fallback(name, context));
    }
    if (typeof fallback === 'boolean') {
        return () => createEvalResult(fallback);
    }
    return () => createEvalResult(false);
}

export function resolveContextValue(
    context: Context,
    field: string,
): string | undefined {
    if (context[field]) {
        return context[field] as string;
    }
    if (context.properties && context.properties[field]) {
        return context.properties[field] as string;
    }
    return undefined;
}

export function safeName(str: string = ''): string {
    return str.replace(/\//g, '_');
}

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
