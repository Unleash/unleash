import type { Context } from 'unleash-client';
import { defaultVariant, selectVariant } from 'unleash-client/lib/variant.js';
import type { FeatureInterface } from './feature.js';
import type { RepositoryInterface } from './repository/index.js';
import type { StrategyExplainer } from './strategy/strategy.js';
import type { PlaygroundStrategySchema } from '../../../openapi/index.js';
import { playgroundStrategyEvaluation } from '../../../openapi/index.js';
import { randomId } from '../../../util/index.js';

export type EvaluatedPlaygroundStrategy = Omit<
    PlaygroundStrategySchema,
    'links'
>;

export type StrategyEvaluationResult = Pick<
    EvaluatedPlaygroundStrategy,
    'result' | 'segments' | 'constraints'
>;

type CompleteStrategyResult = Extract<
    StrategyEvaluationResult['result'],
    { evaluationStatus: 'complete' }
>;

export type EvaluatedVariant = NonNullable<
    CompleteStrategyResult['variant']
> & {
    featureEnabled?: boolean;
    /**
     * @deprecated use featureEnabled
     */
    feature_enabled?: boolean;
};

export type EvaluatedVariantDefinition = NonNullable<
    CompleteStrategyResult['variants']
>[number];

export type FeatureStrategiesEvaluationResult = {
    result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
    variant?: EvaluatedVariant;
    variants?: EvaluatedVariantDefinition[];
    strategies: EvaluatedPlaygroundStrategy[];
    hasUnsatisfiedDependency?: boolean;
};

/** A feature evaluated without looking at any strategy. */
const evaluatedAs = (result: boolean): FeatureStrategiesEvaluationResult => ({
    result,
    strategies: [],
});

const notEnabled = () => evaluatedAs(false);

export default class UnleashClient {
    private repository: RepositoryInterface;

    private strategies: StrategyExplainer[];

    private unknownStrategy: StrategyExplainer;

    constructor(
        repository: RepositoryInterface,
        strategies: StrategyExplainer[],
        unknownStrategy: StrategyExplainer,
    ) {
        this.repository = repository;
        this.strategies = strategies;
        this.unknownStrategy = unknownStrategy;
    }

    private getStrategy(name: string): StrategyExplainer {
        return (
            this.strategies.find((strategy) => strategy.name === name) ??
            this.unknownStrategy
        );
    }

    isParentDependencySatisfied(feature: FeatureInterface, context: Context) {
        if (!feature.dependencies?.length) {
            return true;
        }

        return feature.dependencies.every((parent) => {
            const parentToggle = this.repository.getToggle(parent.feature);

            if (!parentToggle) {
                return false;
            }
            if (parentToggle.dependencies?.length) {
                return false;
            }

            // Same rule as the Node SDK: a parent counts as enabled only if
            // it is enabled in this environment and its strategies pass.
            const parentIsEnabled =
                parentToggle.enabled &&
                this.isEnabled(parent.feature, context).result === true;

            if (parent.enabled !== false) {
                if (parent.variants?.length) {
                    return (
                        parentIsEnabled &&
                        parent.variants.includes(
                            this.getVariant(parent.feature, context).name,
                        )
                    );
                }
                return parentIsEnabled;
            }

            return !parentIsEnabled;
        });
    }

    isEnabled(
        name: string,
        context: Context,
    ): FeatureStrategiesEvaluationResult {
        const feature = this.repository.getToggle(name);
        if (!feature) {
            return { ...notEnabled(), hasUnsatisfiedDependency: false };
        }

        const parentDependencySatisfied = this.isParentDependencySatisfied(
            feature,
            context,
        );
        const result = this.isFeatureEnabled(feature, context);

        return {
            ...result,
            hasUnsatisfiedDependency: !parentDependencySatisfied,
        };
    }

    isFeatureEnabled(
        feature: FeatureInterface,
        context: Context,
    ): FeatureStrategiesEvaluationResult {
        if (!Array.isArray(feature.strategies)) {
            return notEnabled();
        }

        if (feature.strategies.length === 0) {
            return evaluatedAs(feature.enabled);
        }

        const strategies = feature.strategies.map(
            (strategySelector): EvaluatedPlaygroundStrategy => {
                const strategy = this.getStrategy(strategySelector.name);

                const segments =
                    strategySelector.segments
                        ?.map((segmentId) =>
                            this.repository.getSegment(segmentId),
                        )
                        .filter((segment) => segment !== undefined) ?? [];

                const evaluationResult = strategy.explain({
                    parameters: strategySelector.parameters,
                    context,
                    constraints: strategySelector.constraints ?? [],
                    segments,
                    disabled: strategySelector.disabled,
                    variants: strategySelector.variants,
                });

                return {
                    name: strategySelector.name,
                    id: strategySelector.id || randomId(),
                    title: strategySelector.title,
                    disabled: strategySelector.disabled || false,
                    parameters: strategySelector.parameters,
                    ...evaluationResult,
                };
            },
        );

        // Feature evaluation
        const overallStrategyResult = (): [
            boolean | typeof playgroundStrategyEvaluation.unknownResult,
            EvaluatedVariantDefinition[] | undefined,
            EvaluatedVariant | undefined,
        ] => {
            // if at least one strategy is enabled, then the feature is enabled
            const enabledStrategy = strategies.find(
                (strategy) => strategy.result.enabled === true,
            );
            if (
                enabledStrategy &&
                enabledStrategy.result.evaluationStatus === 'complete'
            ) {
                return [
                    true,
                    enabledStrategy.result.variants,
                    enabledStrategy.result.variant || undefined,
                ];
            }

            // if at least one strategy is unknown, then the feature _may_ be enabled
            if (
                strategies.some(
                    (strategy) => strategy.result.enabled === 'unknown',
                )
            ) {
                return [
                    playgroundStrategyEvaluation.unknownResult,
                    undefined,
                    undefined,
                ];
            }

            return [false, undefined, undefined];
        };

        const [result, variants, variant] = overallStrategyResult();
        const evalResults: FeatureStrategiesEvaluationResult = {
            result,
            variant,
            variants,
            strategies,
        };

        return evalResults;
    }

    getVariant(name: string, context: Context): EvaluatedVariant {
        return this.resolveVariant(name, context);
    }

    // This function is intended to close an issue in the proxy where feature enabled
    // state gets checked twice when resolving a variant with random stickiness and
    // gradual rollout. This is not intended for general use, prefer getVariant instead
    forceGetVariant(
        name: string,
        context: Context,
        forcedResult: Pick<
            FeatureStrategiesEvaluationResult,
            'result' | 'variant'
        >,
    ): EvaluatedVariant {
        return this.resolveVariant(name, context, forcedResult);
    }

    private resolveVariant(
        name: string,
        context: Context,
        forcedResult?: Pick<
            FeatureStrategiesEvaluationResult,
            'result' | 'variant'
        >,
    ): EvaluatedVariant {
        const fallback = {
            feature_enabled: false,
            featureEnabled: false,
            ...defaultVariant,
        };
        const feature = this.repository.getToggle(name);

        if (
            typeof feature === 'undefined' ||
            !this.isParentDependencySatisfied(feature, context)
        ) {
            return fallback;
        }

        const result = forcedResult ?? this.isFeatureEnabled(feature, context);
        const enabled = result.result === true;
        fallback.feature_enabled = enabled;
        fallback.featureEnabled = enabled;
        const strategyVariant = result.variant;
        if (enabled && strategyVariant) {
            return {
                ...strategyVariant,
                feature_enabled: true,
                featureEnabled: true,
            };
        }
        if (!enabled) {
            return fallback;
        }

        if (
            !feature.variants ||
            !Array.isArray(feature.variants) ||
            feature.variants.length === 0 ||
            !feature.enabled
        ) {
            return fallback;
        }

        const variant = selectVariant(feature, context);
        if (variant === null) {
            return fallback;
        }

        return {
            name: variant.name,
            payload: variant.payload,
            enabled,
            feature_enabled: true,
            featureEnabled: true,
        };
    }
}
