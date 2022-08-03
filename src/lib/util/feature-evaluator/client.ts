import { EventEmitter } from 'events';
import { Strategy, StrategyTransportInterface } from './strategy';
import { FeatureInterface } from './feature';
import { RepositoryInterface } from './repository';
import {
    Variant,
    getDefaultVariant,
    VariantDefinition,
    selectVariant,
} from './variant';
import { Context } from './context';
import { unknownFeatureEvaluationResult } from '../../openapi/spec/playground-feature-schema';
import { SegmentForEvaluation } from './strategy/strategy';
import { PlaygroundStrategySchema } from 'lib/openapi/spec/playground-strategy-schema';

interface BooleanMap {
    [key: string]: boolean;
}

export type StrategyEvaluationResult = Pick<
    PlaygroundStrategySchema,
    'result' | 'segments' | 'constraints'
>;

export type FeatureEvaluationResult = {
    enabled: boolean | 'unevaluated';
    strategies: PlaygroundStrategySchema[];
};

export default class UnleashClient extends EventEmitter {
    private repository: RepositoryInterface;

    private strategies: Strategy[];

    private warned: BooleanMap;

    constructor(repository: RepositoryInterface, strategies: Strategy[]) {
        super();
        this.repository = repository;
        this.strategies = strategies || [];
        this.warned = {};

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

    warnOnce(
        missingStrategy: string,
        name: string,
        strategies: StrategyTransportInterface[],
    ): void {
        if (!this.warned[missingStrategy + name]) {
            this.warned[missingStrategy + name] = true;
            this.emit(
                'warn',
                `Missing strategy "${missingStrategy}" for toggle "${name}". Ensure that "${strategies
                    .map(({ name: n }) => n)
                    .join(', ')}" are supported before using this toggle`,
            );
        }
    }

    isEnabled(
        name: string,
        context: Context,
        fallback: Function,
    ): FeatureEvaluationResult {
        const feature = this.repository.getToggle(name);
        return this.isFeatureEnabled(feature, context, fallback);
    }

    isFeatureEnabled(
        feature: FeatureInterface,
        context: Context,
        fallback: Function,
    ): FeatureEvaluationResult {
        if (!feature) {
            return fallback();
        }

        if (!Array.isArray(feature.strategies)) {
            const errorMsg = `Malformed feature, strategies not an array, is a ${typeof feature.strategies}`;

            this.emit('error', new Error(errorMsg));
            return {
                enabled: false,
                strategies: [],
            };
        }

        if (feature.strategies.length === 0) {
            return {
                enabled: feature.enabled,
                strategies: [],
            };
        } else {
            const strategies = feature.strategies.map(
                (strategySelector): PlaygroundStrategySchema => {
                    const strategy = this.getStrategy(strategySelector.name);

                    const segments =
                        strategySelector.segments
                            ?.map(this.getSegment(this.repository))
                            .filter(Boolean) ?? [];

                    if (!strategy) {
                        this.warnOnce(
                            strategySelector.name,
                            feature.name,
                            feature.strategies,
                        );

                        const unknownStrategy = this.getStrategy('unknown');
                        const results =
                            unknownStrategy.isEnabledWithConstraints(
                                strategySelector.parameters,
                                context,
                                strategySelector.constraints,
                                segments,
                            );

                        return {
                            name: strategySelector.name,
                            id: strategySelector.id,
                            parameters: strategySelector.parameters,
                            ...results,
                        };
                    }

                    const results = strategy.isEnabledWithConstraints(
                        strategySelector.parameters,
                        context,
                        strategySelector.constraints,
                        segments,
                    );

                    const evalResult = {
                        name: strategySelector.name,
                        id: strategySelector.id,
                        parameters: strategySelector.parameters,
                        ...results,
                    };

                    return evalResult;
                },
            );

            // Feature evaluation
            const isEnabled = () => {
                // if at least one strategy is enabled, then the feature is enabled
                if (
                    strategies.some(
                        (strategy) => strategy.result.enabled === true,
                    )
                ) {
                    return true;
                }

                // if at least one strategy is unknown, then the feature _may_ be enabled
                if (
                    strategies.some(
                        (strategy) => strategy.result.enabled === 'unknown',
                    )
                ) {
                    return unknownFeatureEvaluationResult;
                }

                return false;
            };

            const evalResults: FeatureEvaluationResult = {
                enabled: isEnabled(),
                strategies,
            };

            return evalResults;
        }
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
            feature.variants.length === 0
        ) {
            return fallback;
        }

        let enabled = true;
        if (checkToggle) {
            enabled =
                this.isFeatureEnabled(feature, context, () =>
                    fallbackVariant ? fallbackVariant.enabled : false,
                ).enabled !== false;
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
