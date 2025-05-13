import type { Strategy } from './strategy/index.js';
import type { FeatureInterface } from './feature.js';
import type { RepositoryInterface } from './repository/index.js';
import {
    getDefaultVariant,
    selectVariant,
    type Variant,
    type VariantDefinition,
} from './variant.js';
import type { Context } from './context.js';
import type { SegmentForEvaluation } from './strategy/strategy.js';
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

export type FeatureStrategiesEvaluationResult = {
    result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
    variant?: Variant;
    variants?: VariantDefinition[];
    strategies: EvaluatedPlaygroundStrategy[];
    hasUnsatisfiedDependency?: boolean;
};

export default class UnleashClient {
    private repository: RepositoryInterface;

    private strategies: Strategy[];

    constructor(repository: RepositoryInterface, strategies: Strategy[]) {
        this.repository = repository;
        this.strategies = strategies || [];

        this.strategies.forEach((strategy: Strategy) => {
            if (
                !strategy ||
                !strategy.name ||
                typeof strategy.name !== 'string' ||
                typeof strategy.isEnabled !== 'function'
            ) {
                throw new Error('Invalid strategy data / interface');
            }
        });
    }

    private getStrategy(name: string): Strategy | undefined {
        return this.strategies.find(
            (strategy: Strategy): boolean => strategy.name === name,
        );
    }

    isParentDependencySatisfied(
        feature: FeatureInterface | undefined,
        context: Context,
    ) {
        if (!feature?.dependencies?.length) {
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
            if (Boolean(parent.enabled) !== Boolean(parentToggle.enabled)) {
                return false;
            }

            if (parent.enabled !== false) {
                if (parent.variants?.length) {
                    return parent.variants.includes(
                        this.getVariant(parent.feature, context).name,
                    );
                }
                return (
                    this.isEnabled(parent.feature, context, () => false)
                        .result === true
                );
            }

            return !(
                this.isEnabled(parent.feature, context, () => false).result ===
                true
            );
        });
    }

    isEnabled(
        name: string,
        context: Context,
        fallback: Function,
    ): FeatureStrategiesEvaluationResult {
        const feature = this.repository.getToggle(name);

        const parentDependencySatisfied = this.isParentDependencySatisfied(
            feature,
            context,
        );
        const result = this.isFeatureEnabled(feature, context, fallback);

        return {
            ...result,
            hasUnsatisfiedDependency: !parentDependencySatisfied,
        };
    }

    isFeatureEnabled(
        feature: FeatureInterface,
        context: Context,
        fallback: Function,
    ): FeatureStrategiesEvaluationResult {
        if (!feature) {
            return fallback();
        }

        if (!Array.isArray(feature.strategies)) {
            return {
                result: false,
                strategies: [],
            };
        }

        if (feature.strategies.length === 0) {
            return {
                result: feature.enabled,
                strategies: [],
            };
        }

        const strategies = feature.strategies.map(
            (strategySelector): EvaluatedPlaygroundStrategy => {
                const getStrategy = (): Strategy => {
                    // assume that 'unknown' strategy is always present
                    const unknownStrategy = this.getStrategy(
                        'unknown',
                    ) as Strategy;

                    // the application hostname strategy relies on external
                    // variables to calculate its result. As such, we can't
                    // evaluate it in a way that makes sense. So we'll
                    // use the 'unknown' strategy instead.
                    if (strategySelector.name === 'applicationHostname') {
                        return unknownStrategy;
                    }

                    return (
                        this.getStrategy(strategySelector.name) ??
                        unknownStrategy
                    );
                };

                const strategy = getStrategy();

                const segments =
                    (strategySelector.segments
                        ?.map(this.getSegment(this.repository))
                        .filter(Boolean) as SegmentForEvaluation[]) ?? [];

                const evaluationResult = strategy.isEnabledWithConstraints(
                    strategySelector.parameters,
                    context,
                    strategySelector.constraints,
                    segments,
                    strategySelector.disabled,
                    strategySelector.variants,
                );

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
            VariantDefinition[] | undefined,
            Variant | undefined,
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

    getSegment(repo: RepositoryInterface) {
        return (segmentId: number): SegmentForEvaluation | undefined => {
            const segment = repo.getSegment(segmentId);
            if (!segment) {
                return undefined;
            }
            return {
                name: segment.name,
                id: segmentId,
                constraints: segment.constraints,
            };
        };
    }

    getVariant(
        name: string,
        context: Context,
        fallbackVariant?: Variant,
    ): Variant {
        return this.resolveVariant(name, context, fallbackVariant);
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
        fallbackVariant?: Variant,
    ): Variant {
        return this.resolveVariant(
            name,
            context,
            fallbackVariant,
            forcedResult,
        );
    }

    private resolveVariant(
        name: string,
        context: Context,
        fallbackVariant?: Variant,
        forcedResult?: Pick<
            FeatureStrategiesEvaluationResult,
            'result' | 'variant'
        >,
    ): Variant {
        const fallback = {
            feature_enabled: false,
            featureEnabled: false,
            ...(fallbackVariant || getDefaultVariant()),
        };
        const feature = this.repository.getToggle(name);

        if (
            typeof feature === 'undefined' ||
            !this.isParentDependencySatisfied(feature, context)
        ) {
            return fallback;
        }

        const result =
            forcedResult ??
            this.isFeatureEnabled(feature, context, () =>
                fallbackVariant ? fallbackVariant.enabled : false,
            );
        const enabled = result.result === true;
        fallback.feature_enabled = fallbackVariant?.feature_enabled ?? enabled;
        fallback.featureEnabled = fallback.feature_enabled;
        const strategyVariant = result.variant;
        if (enabled && strategyVariant) {
            return strategyVariant;
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

        const variant: VariantDefinition | null = selectVariant(
            feature,
            context,
        );
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
