import fc, { Arbitrary } from 'fast-check';

import { strategies } from '../../lib/routes/admin-api/playground.test';
import { mapToggles } from './playground-service';
import { FeatureConfigurationClient } from '../../lib/types/stores/feature-strategies-store';
import { urlFriendlyString } from '../../lib/openapi/spec/playground-request-schema.test';
import { WeightType } from '../../lib/types/model';
// import { createTestConfig } from '../../test/config/test-config';
// const config: IUnleashConfig = createTestConfig();

describe('the playground service', () => {
    // test('should return the same enabled toggles as the raw SDK', async () => {
    //     await fc.assert(
    //         fc.asyncProperty(
    //             generateToggles(),
    //             generateContext(),
    //             async (toggles, context) => {
    //                 // is there a good way to seed toggles here? relying on
    //                 // generators to generate actual toggles works for the most
    //                 // part, but might require a lot of work to make strategies
    //                 // work correctly.

    //                 //@ts-expect-error
    //                 const serviceToggles = service.evaluateToggles(
    //                     toggles,
    //                     context,
    //                 );

    //                 //@ts-expect-error
    //                 const client = offlineClientFromContext(context, toggles);

    //                 //@ts-expect-error
    //                 const sdkToggles = client.getToggles();

    //                 // If A ⊆ B and B ⊆ A, then A = B
    //                 expect(sdkToggles).toEqual(
    //                     expect.arrayContaining(serviceToggles),
    //                 );
    //                 expect(serviceToggles).toEqual(
    //                     expect.arrayContaining(sdkToggles),
    //                 );

    //                 return true;
    //             },
    //         ),
    //     );
    // });

    const clientFeatures = (): Arbitrary<FeatureConfigurationClient[]> =>
        fc.uniqueArray(
            fc.record(
                {
                    name: urlFriendlyString(),
                    type: fc.constantFrom(
                        'release',
                        'kill-switch',
                        'experiment',
                        'operational',
                        'permission',
                    ),
                    enabled: fc.boolean(),
                    stale: fc.boolean(),
                    strategies: strategies(),
                    impressionData: fc.boolean(),
                    variants: fc.array(
                        fc.record({
                            name: urlFriendlyString(),
                            weight: fc.nat({ max: 100 }),
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
                                            .map((ls) => ls.join(',')),
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
                {
                    requiredKeys: [
                        'name',
                        'type',
                        'enabled',
                        'stale',
                        'variants',
                        'strategies',
                        'impressionData',
                    ],
                },
            ),
            { selector: (v) => v.name },
        );

    test('should map correctly from SDK output to endpoint output', () => {
        fc.assert(
            fc.property(clientFeatures(), (toggles) => {
                const mappedToggles = mapToggles(toggles);

                return toggles.every((x, n) => {
                    const mapped = mappedToggles[n];

                    const enabledIsValid = !(
                        x.strategies.length === 0 && mapped.isEnabled
                    );
                    // ^ if the original has no strategies, then the mapped
                    // version should never be enabled

                    const variants = x.variants ?? [];

                    const variantIsValid =
                        variants.length > 0
                            ? variants
                                  .map((v) => v.name)
                                  .includes(mapped.variant)
                            : mapped.variant === null;

                    // ^ the mapped variant must be one of the original variants
                    // if they exist. If they do not exist, then the mapped
                    // variant must be null.

                    return (
                        x.name === mapped.name &&
                        // ^ the mapped name must be the same as the original name.
                        enabledIsValid &&
                        variantIsValid
                    );
                });
            }),
        );
    });
});
