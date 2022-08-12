import { Strategy } from './strategy';
import { FeatureInterface } from './feature';
import { RepositoryInterface } from './repository';
import {
    Variant,
    getDefaultVariant,
    VariantDefinition,
    selectVariant,
} from './variant';
import { Context } from './context';
import { SegmentForEvaluation } from './strategy/strategy';
import { PlaygroundStrategySchema } from 'lib/openapi/spec/playground-strategy-schema';
import { playgroundStrategyEvaluation } from '../../openapi/spec/playground-strategy-schema';

export type StrategyEvaluationResult = Pick<
    PlaygroundStrategySchema,
    'result' | 'segments' | 'constraints'
>;

export type FeatureStrategiesEvaluationResult = {
    result: boolean | typeof playgroundStrategyEvaluation.unknownResult;
    strategies: PlaygroundStrategySchema[];
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
                !strategy.isEnabled ||
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

    isEnabled(
        name: string,
        context: Context,
        fallback: Function,
    ): FeatureStrategiesEvaluationResult {
        const feature = this.repository.getToggle(name);
        return this.isFeatureEnabled(feature, context, fallback);
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
            (strategySelector): PlaygroundStrategySchema => {
                const getStrategy = () => {
                    // the application hostname strategy relies on external
                    // variables to calculate its result. As such, we can't
                    // evaluate it in a way that makes sense. So we'll
                    // use the 'unknown' strategy instead.
                    if (strategySelector.name === 'applicationHostname') {
                        return this.getStrategy('unknown');
                    }
                    return (
                        this.getStrategy(strategySelector.name) ??
                        this.getStrategy('unknown')
                    );
                };

                const strategy = getStrategy();

                const segments =
                    strategySelector.segments
                        ?.map(this.getSegment(this.repository))
                        .filter(Boolean) ?? [];

                return {
                    name: strategySelector.name,
                    id: strategySelector.id,
                    parameters: strategySelector.parameters,
                    ...strategy.isEnabledWithConstraints(
                        strategySelector.parameters,
                        context,
                        strategySelector.constraints,
                        segments,
                    ),
                };
            },
        );

        // Feature evaluation
        const overallStrategyResult = () => {
            // if at least one strategy is enabled, then the feature is enabled
            if (
                strategies.some((strategy) => strategy.result.enabled === true)
            ) {
                return true;
            }

            // if at least one strategy is unknown, then the feature _may_ be enabled
            if (
                strategies.some(
                    (strategy) => strategy.result.enabled === 'unknown',
                )
            ) {
                return playgroundStrategyEvaluation.unknownResult;
            }

            return false;
        };

        const evalResults: FeatureStrategiesEvaluationResult = {
            result: overallStrategyResult(),
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
        return this.resolveVariant(name, context, true, fallbackVariant);
    }

    // This function is intended to close an issue in the proxy where feature enabled
    // state gets checked twice when resolving a variant with random stickiness and
    // gradual rollout. This is not intended for general use, prefer getVariant instead
    forceGetVariant(
        name: string,
        context: Context,
        fallbackVariant?: Variant,
    ): Variant {
        return this.resolveVariant(name, context, false, fallbackVariant);
    }

    private resolveVariant(
        name: string,
        context: Context,
        checkToggle: boolean,
        fallbackVariant?: Variant,
    ): Variant {
        const fallback = fallbackVariant || getDefaultVariant();
        const feature = this.repository.getToggle(name);
        if (
            typeof feature === 'undefined' ||
            !feature.variants ||
            !Array.isArray(feature.variants) ||
            feature.variants.length === 0 ||
            !feature.enabled
        ) {
            return fallback;
        }

        let enabled = true;
        if (checkToggle) {
            enabled =
                this.isFeatureEnabled(feature, context, () =>
                    fallbackVariant ? fallbackVariant.enabled : false,
                ).result === true;
            if (!enabled) {
                return fallback;
            }
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
            enabled: !checkToggle || enabled,
        };
    }
}
