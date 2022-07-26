import fc, { Arbitrary } from 'fast-check';
import {
    strategyConstraint,
    urlFriendlyString,
} from '../../../test/arbitraries.test';
import { validateSchema } from '../validate';
import {
    PlaygroundConstraintSchema,
    playgroundFeatureSchema,
    PlaygroundFeatureSchema,
    PlaygroundSegmentSchema,
    PlaygroundStrategySchema,
} from './playground-feature-schema';

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
        name: fc.constant(name),
        result: fc.oneof(fc.boolean(), fc.constant('not found' as 'not found')),
        parameters,
        constraints: playgroundStrategyConstraints(),
        segments: fc.array(playgroundSegment()),
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
                'userWithId',
                fc.record({
                    userIds: fc
                        .uniqueArray(fc.emailAddress())
                        .map((ids) => ids.join(',')),
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
        .oneof(fc.boolean(), fc.constant('unevaluated' as 'unevaluated'))
        .chain((isEnabled) =>
            fc.record({
                isEnabled: fc.constant(isEnabled),
                projectId: urlFriendlyString(),
                name: urlFriendlyString(),
                // strategies: playgroundStrategies(),
                strategies: fc.constant([]),
                variant: fc.record(
                    {
                        name: urlFriendlyString(),
                        enabled:
                            isEnabled === 'unevaluated'
                                ? fc.constant(false)
                                : fc.constant(isEnabled),
                        payload: fc.oneof(
                            fc.record({
                                type: fc.constant('json' as 'json'),
                                value: fc.json(),
                            }),
                            fc.record({
                                type: fc.constant('csv' as 'csv'),
                                value: fc
                                    .array(fc.lorem())
                                    .map((words) => words.join(',')),
                            }),
                            fc.record({
                                type: fc.constant('string' as 'string'),
                                value: fc.string(),
                            }),
                        ),
                    },
                    { requiredKeys: ['name', 'enabled'] },
                ),
            }),
        );

test('playgroundFeatureSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundFeatureSchema) =>
                validateSchema(playgroundFeatureSchema.$id, data) === undefined,
        ),
    ));
