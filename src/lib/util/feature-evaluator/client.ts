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

interface BooleanMap {
    [key: string]: boolean;
}

export type EnabledStatus = {
    enabled: boolean;
    reasons: string[];
};

const appendStrategyStatuses = (...statuses: EnabledStatus[]): EnabledStatus =>
    statuses.reduce((acc, next) => {
        if (acc.enabled && next.enabled) {
            return {
                enabled: true,
                reasons: [...acc.reasons, ...next.reasons],
            };
        } else if (acc.enabled) {
            return acc;
        } else if (next.enabled) {
            return next;
        } else {
            return {
                enabled: false,
                reasons: [...acc.reasons, ...next.reasons],
            };
        }

        // switch ([acc.enabled, next.enabled]) {
        //     case [true, true]:
        //         return {
        //             enabled: true,
        //             reasons: [...acc.reasons, ...next.reasons],
        //         };
        //     case [true, false]:
        //         // if one strat is true, the feature is enabled
        //         return acc;
        //     case [false, true]:
        //         return next;
        //     case [false, false]:
        //         return {
        //             enabled: false,
        //             reasons: [...acc.reasons, ...next.reasons],
        //         };
        //     default:
        //         return acc;
        // }
    });

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
    ) {
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
    ): EnabledStatus {
        const feature = this.repository.getToggle(name);
        return this.isFeatureEnabled(feature, context, fallback);
    }

    isFeatureEnabled(
        feature: FeatureInterface,
        context: Context,
        fallback: Function,
    ): EnabledStatus {
        if (!feature) {
            return fallback();
        }

        if (!feature || !feature.enabled) {
            return {
                enabled: false,
                reasons: [
                    "The feature doesn't exist or isn't enabled in this environment.",
                ],
            };
        }

        if (!Array.isArray(feature.strategies)) {
            const errorMsg = `Malformed feature, strategies not an array, is a ${typeof feature.strategies}`;

            this.emit('error', new Error(errorMsg));
            return {
                enabled: false,
                reasons: [
                    `The feature is malformed and could not be read: ${errorMsg} `,
                ],
            };
        }

        if (feature.strategies.length === 0) {
            const reason = feature.enabled
                ? "The feature has no strategies, but is marked as enabled in this environment, so it's enabled by default."
                : 'The feature has no strategies and is not enabled in this environment.';
            return {
                enabled: feature.enabled,
                reasons: [reason],
            };
        } else {
            const evalResults = appendStrategyStatuses(
                ...feature.strategies.map((strategySelector): EnabledStatus => {
                    const strategy = this.getStrategy(strategySelector.name);
                    if (!strategy) {
                        this.warnOnce(
                            strategySelector.name,
                            feature.name,
                            feature.strategies,
                        );
                        return {
                            enabled: false,
                            reasons: [
                                `Couldn't find the strategy called ${strategySelector.name}`,
                            ],
                        };
                    }

                    return strategy.isEnabledWithConstraints(
                        strategySelector.parameters,
                        context,
                        strategySelector.constraints,
                    );
                }),
            );

            return evalResults;
            // return feature.strategies.some((strategySelector): boolean => {
            //     const strategy = this.getStrategy(strategySelector.name);
            //     if (!strategy) {
            //         this.warnOnce(
            //             strategySelector.name,
            //             feature.name,
            //             feature.strategies,
            //         );
            //         return false;
            //     }
            //     return strategy.isEnabledWithConstraints(
            //         strategySelector.parameters,
            //         context,
            //         strategySelector.constraints,
            //     );
            // });
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
            enabled = this.isFeatureEnabled(feature, context, () =>
                fallbackVariant ? fallbackVariant.enabled : false,
            ).enabled;
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
