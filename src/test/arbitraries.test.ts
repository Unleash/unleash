import fc, { Arbitrary } from 'fast-check';

import { ALL_OPERATORS } from '../lib/util/constants';
import { ClientFeatureSchema } from '../lib/openapi/spec/client-feature-schema';
import { WeightType } from '../lib/types/model';
import { FeatureStrategySchema } from '../lib/openapi/spec/feature-strategy-schema';
import { ConstraintSchema } from 'lib/openapi/spec/constraint-schema';

export const urlFriendlyString = (): Arbitrary<string> =>
    fc
        .array(
            fc.oneof(
                fc.integer({ min: 0x30, max: 0x39 }).map(String.fromCharCode), // numbers
                fc.integer({ min: 0x41, max: 0x5a }).map(String.fromCharCode), // UPPERCASE LETTERS
                fc.integer({ min: 0x61, max: 0x7a }).map(String.fromCharCode), // lowercase letters
                fc.constantFrom('-', '_', '~', '.'), // rest
                fc.lorem({ maxCount: 1 }), // random words for more 'realistic' names
            ),
            { minLength: 1 },
        )
        .map((arr) => arr.join(''));

export const commonISOTimestamp = (): Arbitrary<string> =>
    fc
        .date({
            min: new Date('1900-01-01T00:00:00.000Z'),
            max: new Date('9999-12-31T23:59:59.999Z'),
        })
        .map((timestamp) => timestamp.toISOString());

const strategyConstraints = (): Arbitrary<ConstraintSchema[]> =>
    fc.array(
        fc.record({
            contextName: urlFriendlyString(),
            operator: fc.constantFrom(...ALL_OPERATORS),
            caseInsensitive: fc.boolean(),
            inverted: fc.boolean(),
            values: fc.array(fc.string()),
            value: fc.string(),
        }),
    );

const strategy = (
    name: string,
    parameters: Arbitrary<Record<string, string>>,
) =>
    fc.record({
        name: fc.constant(name),
        parameters,
        constraints: strategyConstraints(),
    });

export const strategies = (): Arbitrary<FeatureStrategySchema[]> =>
    fc.array(
        fc.oneof(
            strategy('default', fc.constant({})),
            strategy(
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
            strategy(
                'applicationHostname',
                fc.record({
                    hostNames: fc
                        .uniqueArray(fc.domain())
                        .map((domains) => domains.join(',')),
                }),
            ),

            strategy(
                'userWithId',
                fc.record({
                    userIds: fc
                        .uniqueArray(fc.emailAddress())
                        .map((ids) => ids.join(',')),
                }),
            ),
            strategy(
                'remoteAddress',
                fc.record({
                    IPs: fc.uniqueArray(fc.ipV4()).map((ips) => ips.join(',')),
                }),
            ),
        ),
    );

export const generateClientFeature = (
    name?: string,
): Arbitrary<ClientFeatureSchema> =>
    fc.record(
        {
            name: name ? fc.constant(name) : urlFriendlyString(),
            type: fc.constantFrom(
                'release',
                'kill-switch',
                'experiment',
                'operational',
                'permission',
            ),
            description: fc.lorem(),
            project: urlFriendlyString(),
            enabled: fc.boolean(),
            createdAt: commonISOTimestamp(),
            lastSeenAt: commonISOTimestamp(),
            stale: fc.boolean(),
            impressionData: fc.option(fc.boolean()),
            strategies: strategies(),
            variants: fc.array(
                fc.record({
                    name: urlFriendlyString(),
                    weight: fc.nat({ max: 1000 }),
                    weightType: fc.constant(WeightType.VARIABLE),
                    stickiness: fc.constant('default'),
                    payload: fc.option(
                        fc.oneof(
                            fc.record({
                                type: fc.constant('json'),
                                value: fc.json(),
                            }),
                            fc.record({
                                type: fc.constant('csv'),
                                value: fc
                                    .array(fc.lorem())
                                    .map((words) => words.join(',')),
                            }),
                            fc.record({
                                type: fc.constant('string'),
                                value: fc.string(),
                            }),
                        ),
                    ),
                }),
            ),
        },
        { requiredKeys: ['name', 'enabled', 'project', 'strategies'] },
    );

export const generateClientFeatures = (constraints?: {
    minLength?: number;
}): Arbitrary<ClientFeatureSchema[]> =>
    fc.uniqueArray(generateClientFeature(), {
        ...constraints,
        selector: (v) => v.name,
    });

// TEST ARBITRARIES

test('url-friendly strings are URL-friendly', () =>
    fc.assert(
        fc.property(urlFriendlyString(), (input: string) =>
            /^[\w~.-]+$/.test(input),
        ),
    ));
