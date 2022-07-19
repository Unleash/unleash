import fc, { Arbitrary } from 'fast-check';
import { urlFriendlyString, variants } from '../../../test/arbitraries.test';
import { validateSchema } from '../validate';
import {
    playgroundFeatureSchema,
    PlaygroundFeatureSchema,
} from './playground-feature-schema';

export const generate = (): Arbitrary<PlaygroundFeatureSchema> =>
    fc
        .tuple(
            fc.boolean(),
            variants(),
            fc.nat(),
            fc.record({
                projectId: urlFriendlyString(),
                name: urlFriendlyString(),
            }),
        )
        .map(([isEnabled, generatedVariants, activeVariantIndex, feature]) => {
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
                    enabled: isEnabled,
                    name: targetVariant.name,
                    payload: targetPayload,
                };
            }

            return {
                ...feature,
                isEnabled,
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
