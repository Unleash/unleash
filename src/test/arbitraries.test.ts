import fc, { Arbitrary } from 'fast-check';

import { ALL_OPERATORS } from '../lib/util/constants';
import { ClientFeatureSchema } from '../lib/openapi/spec/client-feature-schema';
import { IVariant, WeightType } from '../lib/types/model';
import { FeatureStrategySchema } from '../lib/openapi/spec/feature-strategy-schema';
import { ConstraintSchema } from 'lib/openapi/spec/constraint-schema';
import { SegmentSchema } from 'lib/openapi/spec/segment-schema';

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

export const strategyConstraint = (): Arbitrary<ConstraintSchema> =>
    fc.record({
        contextName: urlFriendlyString(),
        operator: fc.constantFrom(...ALL_OPERATORS),
        caseInsensitive: fc.boolean(),
        inverted: fc.boolean(),
        values: fc.array(fc.string()),
        value: fc.string(),
    });

const strategyConstraints = (): Arbitrary<ConstraintSchema[]> =>
    fc.array(strategyConstraint());

export const strategy = (
    name: string,
    parameters?: Arbitrary<Record<string, string>>,
): Arbitrary<FeatureStrategySchema> =>
    parameters
        ? fc.record(
              {
                  name: fc.constant(name),
                  id: fc.uuid(),
                  parameters,
                  segments: fc.uniqueArray(fc.integer({ min: 1 })),
                  constraints: strategyConstraints(),
              },
              { requiredKeys: ['name', 'parameters', 'id'] },
          )
        : fc.record(
              {
                  id: fc.uuid(),
                  name: fc.constant(name),
                  segments: fc.uniqueArray(fc.integer({ min: 1 })),
                  constraints: strategyConstraints(),
              },
              { requiredKeys: ['name', 'id'] },
          );

export const segment = (): Arbitrary<SegmentSchema> =>
    fc.record({
        id: fc.integer({ min: 1 }),
        name: urlFriendlyString(),
        constraints: strategyConstraints(),
    });

export const strategies = (): Arbitrary<FeatureStrategySchema[]> =>
    fc.uniqueArray(
        fc.oneof(
            strategy('default'),
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
            strategy(
                'custom-strategy',
                fc.record({
                    customParam: fc
                        .uniqueArray(fc.lorem())
                        .map((words) => words.join(',')),
                }),
            ),
        ),
        { selector: (generatedStrategy) => generatedStrategy.id },
    );

export const variant = (): Arbitrary<IVariant> =>
    fc.record(
        {
            name: urlFriendlyString(),
            weight: fc.nat({ max: 1000 }),
            weightType: fc.constant(WeightType.VARIABLE),
            stickiness: fc.constant('default'),
            payload: fc.option(
                fc.oneof(
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
                { nil: undefined },
            ),
        },
        { requiredKeys: ['name', 'weight', 'weightType', 'stickiness'] },
    );

export const variants = (): Arbitrary<IVariant[]> =>
    fc
        .uniqueArray(variant(), {
            maxLength: 1000,
            selector: (variantInstance) => variantInstance.name,
        })
        .map((allVariants) =>
            allVariants.map((variantInstance) => ({
                ...variantInstance,
                weight: Math.round(1000 / allVariants.length),
            })),
        );

export const clientFeature = (name?: string): Arbitrary<ClientFeatureSchema> =>
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
            variants: variants(),
        },
        { requiredKeys: ['name', 'enabled', 'project', 'strategies'] },
    );

export const clientFeatures = (constraints?: {
    minLength?: number;
}): Arbitrary<ClientFeatureSchema[]> =>
    fc.uniqueArray(clientFeature(), {
        ...constraints,
        selector: (v) => v.name,
    });

export const clientFeaturesAndSegments = (featureConstraints?: {
    minLength?: number;
}): Arbitrary<{
    features: ClientFeatureSchema[];
    segments: SegmentSchema[];
}> => {
    const segments = () =>
        fc.uniqueArray(segment(), {
            selector: (generatedSegment) => generatedSegment.id,
        });

    // create segments and make sure that all strategies reference segments that
    // exist
    return fc
        .tuple(segments(), clientFeatures(featureConstraints))
        .map(([generatedSegments, generatedFeatures]) => {
            const renumberedSegments = generatedSegments.map(
                (generatedSegment, index) => ({
                    ...generatedSegment,
                    id: index + 1,
                }),
            );

            const features: ClientFeatureSchema[] = generatedFeatures.map(
                (feature) => ({
                    ...feature,
                    ...(feature.strategies && {
                        strategies: feature.strategies.map(
                            (generatedStrategy) => ({
                                ...generatedStrategy,
                                ...(generatedStrategy.segments && {
                                    segments:
                                        renumberedSegments.length > 0
                                            ? [
                                                  ...new Set(
                                                      generatedStrategy.segments.map(
                                                          (generatedSegment) =>
                                                              (generatedSegment %
                                                                  renumberedSegments.length) +
                                                              1,
                                                      ),
                                                  ),
                                              ]
                                            : [],
                                }),
                            }),
                        ),
                    }),
                }),
            );

            return {
                features,
                segments: renumberedSegments,
            };
        });
};

// TEST ARBITRARIES

test('url-friendly strings are URL-friendly', () =>
    fc.assert(
        fc.property(urlFriendlyString(), (input: string) =>
            /^[\w~.-]+$/.test(input),
        ),
    ));

test('variant payloads are either present or undefined; never null', () =>
    fc.assert(
        fc.property(
            variant(),
            (generatedVariant) =>
                !!generatedVariant.payload ||
                generatedVariant.payload === undefined,
        ),
    ));
