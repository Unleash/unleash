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
import type { PlaygroundStrategySchema } from '../../openapi/spec/playground-feature-schema';
import { Constraint, Segment } from './strategy/strategy';

interface BooleanMap {
    [key: string]: boolean;
}

export type NamedStrategyEvaluationResult = PlaygroundStrategySchema;
export type StrategyEvaluationResult = Omit<
    NamedStrategyEvaluationResult,
    'name'
>;

export type FeatureEvaluationResult = {
    enabled: boolean | 'unevaluated';
    strategies: NamedStrategyEvaluationResult[];
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

        if (!feature) {
            return {
                enabled: false,
                strategies: [],
            };
        }

        if (!Array.isArray(feature.strategies)) {
            const errorMsg = `Malformed feature, strategies not an array, is a ${typeof feature.strategies}`;

            this.emit('error', new Error(errorMsg));
            return {
                enabled: false,
                strategies: [],
                // reasons: [
                //     `The feature is malformed and could not be read: ${errorMsg} `,
                // ],
            };
        }

        // // this must be moved much later, apparently, so we can also evaluate the strategies
        // if (!feature.enabled) {
        //     return {
        //         enabled: false,
        //         strategies: [],
        //         // reasons: [
        //         //     "The feature doesn't exist or isn't enabled in this environment.",
        //         // ],
        //     };
        // }

        if (feature.strategies.length === 0) {
            return {
                enabled: feature.enabled,
                strategies: [],
                // reasons: [reason],
            };
        } else {
            const strategies = feature.strategies.map(
                (strategySelector): NamedStrategyEvaluationResult => {
                    const strategy = this.getStrategy(strategySelector.name);
                    if (!strategy) {
                        this.warnOnce(
                            strategySelector.name,
                            feature.name,
                            feature.strategies,
                        );

                        return {
                            name: strategySelector.name,
                            result: 'not found',
                            // reasons: [
                            //     `Couldn't find the strategy called ${strategySelector.name}`,
                            // ],
                        };
                    }

                    const results = strategy.isEnabledWithConstraints(
                        strategySelector.parameters,
                        context,
                        this.yieldConstraintsFor(strategySelector),
                    );

                    const isEmptyObject = (obj: {}) =>
                        !Object.keys(obj).some(Boolean);

                    const evalResult = {
                        name: strategySelector.name,
                        ...results,
                        ...(!isEmptyObject(strategySelector.parameters) && {
                            parameters: strategySelector.parameters,
                        }),
                    };

                    return evalResult;
                },
            );

            const isEnabled: boolean | 'unevaluated' = strategies.every(
                (strategy) => strategy.result === 'not found',
            )
                ? ('unevaluated' as 'unevaluated')
                : feature.enabled &&
                  strategies.some((strategy) => strategy.result === true);

            const evalResults: FeatureEvaluationResult = {
                enabled: isEnabled,
                strategies,
            };
            return evalResults;
        }
    }

    *yieldConstraintsFor(
        strategy: StrategyTransportInterface,
    ): IterableIterator<Constraint | undefined> {
        if (strategy.constraints) {
            yield* strategy.constraints;
        }
        const segments = strategy.segments?.map((segmentId) =>
            this.repository.getSegment(segmentId),
        );
        if (!segments) {
            return;
        }
        yield* this.yieldSegmentConstraints(segments);
    }

    *yieldSegmentConstraints(
        segments: (Segment | undefined)[],
    ): IterableIterator<Constraint | undefined> {
        // eslint-disable-next-line no-restricted-syntax
        for (const segment of segments) {
            if (segment) {
                // eslint-disable-next-line no-restricted-syntax
                for (const constraint of segment?.constraints) {
                    yield constraint;
                }
            } else {
                yield undefined;
            }
        }
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
            enabled = Boolean(
                this.isFeatureEnabled(feature, context, () =>
                    fallbackVariant ? fallbackVariant.enabled : false,
                ).enabled,
            );
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
