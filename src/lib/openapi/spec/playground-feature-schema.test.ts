import fc, { type Arbitrary } from 'fast-check';
import {
    strategyConstraint,
    urlFriendlyString,
    variants,
} from '../../../test/arbitraries.test.js';
import { validateSchema } from '../validate.js';
import type { PlaygroundConstraintSchema } from './playground-constraint-schema.js';
import {
    playgroundFeatureSchema,
    type PlaygroundFeatureSchema,
} from './playground-feature-schema.js';
import type { PlaygroundSegmentSchema } from './playground-segment-schema.js';
import {
    playgroundStrategyEvaluation,
    type PlaygroundStrategySchema,
} from './playground-strategy-schema.js';

const playgroundStrategyConstraint =
    (): Arbitrary<PlaygroundConstraintSchema> =>
        fc
            .tuple(fc.boolean(), strategyConstraint())
            .map(([result, constraint]) => ({
                ...constraint,
                result,
            }));

const playgroundStrategyConstraints = (): Arbitrary<
    PlaygroundConstraintSchema[]
> => fc.array(playgroundStrategyConstraint());

const playgroundSegment = (): Arbitrary<PlaygroundSegmentSchema> =>
    fc.record({
        name: fc.string({ minLength: 1 }),
        id: fc.nat(),
        result: fc.boolean(),
        constraints: playgroundStrategyConstraints(),
    });

const playgroundStrategy = (
    name: string,
    parameters: Arbitrary<Record<string, string>>,
): Arbitrary<PlaygroundStrategySchema> =>
    fc.record({
        id: fc.uuid(),
        name: fc.constant(name),
        result: fc.oneof(
            fc.record({
                evaluationStatus: fc.constant(
                    playgroundStrategyEvaluation.evaluationComplete,
                ),
                enabled: fc.boolean(),
            }),
            fc.record({
                evaluationStatus: fc.constant(
                    playgroundStrategyEvaluation.evaluationIncomplete,
                ),
                enabled: fc.constantFrom(
                    playgroundStrategyEvaluation.unknownResult,
                    false as false,
                ),
            }),
        ),
        parameters,
        constraints: playgroundStrategyConstraints(),
        segments: fc.array(playgroundSegment()),
        disabled: fc.boolean(),
        links: fc.constant({
            edit: '/projects/some-project/features/some-feature/strategies/edit?environmentId=some-env&strategyId=some-strat',
        }),
    });

const playgroundStrategies = (): Arbitrary<PlaygroundStrategySchema[]> =>
    fc.array(
        fc.oneof(
            playgroundStrategy('default', fc.constant({})),
            playgroundStrategy(
                'flexibleRollout',
                fc.record({
                    groupId: fc.lorem({ maxCount: 1 }),
                    rollout: fc.nat({ max: 100 }).map(String),
                    stickiness: fc.constantFrom(
                        'default',
                        'userId',
                        'sessionId',
                    ),
                }),
            ),
            playgroundStrategy(
                'applicationHostname',
                fc.record({
                    hostNames: fc
                        .uniqueArray(fc.domain())
                        .map((domains) => domains.join(',')),
                }),
            ),

            playgroundStrategy(
                'remoteAddress',
                fc.record({
                    IPs: fc.uniqueArray(fc.ipV4()).map((ips) => ips.join(',')),
                }),
            ),
        ),
    );

export const generate = (): Arbitrary<PlaygroundFeatureSchema> =>
    fc
        .tuple(
            variants(),
            fc.nat(),
            fc.record({
                isEnabledInCurrentEnvironment: fc.boolean(),
                projectId: urlFriendlyString(),
                name: urlFriendlyString(),
                strategies: playgroundStrategies(),
            }),
        )
        .map(([generatedVariants, activeVariantIndex, feature]) => {
            const strategyResult = () => {
                const { strategies } = feature;

                if (
                    strategies.some(
                        (strategy) => strategy.result.enabled === true,
                    )
                ) {
                    return true;
                }
                if (
                    strategies.some(
                        (strategy) => strategy.result.enabled === 'unknown',
                    )
                ) {
                    return 'unknown';
                }
                return false;
            };

            const isEnabled =
                feature.isEnabledInCurrentEnvironment &&
                strategyResult() === true;

            // the active variant is the disabled variant if the feature is
            // disabled or has no variants.
            let activeVariant = { name: 'disabled', enabled: false } as {
                name: string;
                enabled: boolean;
                payload?: {
                    type: 'string' | 'json' | 'csv';
                    value: string;
                };
            };

            if (generatedVariants.length && isEnabled) {
                const targetVariant =
                    generatedVariants[
                        activeVariantIndex % generatedVariants.length
                    ];
                const targetPayload = targetVariant.payload
                    ? (targetVariant.payload as {
                          type: 'string' | 'json' | 'csv';
                          value: string;
                      })
                    : undefined;

                activeVariant = {
                    enabled: true,
                    name: targetVariant.name,
                    payload: targetPayload,
                };
            }

            return {
                ...feature,
                isEnabled,
                strategies: {
                    result: strategyResult(),
                    data: feature.strategies,
                },
                variants: generatedVariants,
                variant: activeVariant,
            };
        });

test('playgroundFeatureSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            fc.context(),
            (data: PlaygroundFeatureSchema, ctx) => {
                const results = validateSchema(
                    playgroundFeatureSchema.$id,
                    data,
                );
                ctx.log(JSON.stringify(results));
                return results === undefined;
            },
        ),
    ));
