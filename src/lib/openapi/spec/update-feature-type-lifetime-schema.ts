import type { FromSchema } from 'json-schema-to-ts';

export const updateFeatureTypeLifetimeSchema = {
    $id: '#/components/schemas/updateFeatureTypeLifetimeSchema',
    type: 'object',
    required: ['lifetimeDays'],
    description:
        'Data used when updating the lifetime of a [feature flag type](https://docs.getunleash.io/concepts/feature-flags#feature-flag-types).',
    properties: {
        lifetimeDays: {
            description:
                'The new lifetime (in days) that you want to assign to the feature flag type. If the value is `null` or `0`, then the feature flags of that type will never be marked as potentially stale. Otherwise, they will be considered potentially stale after the number of days indicated by this property.',
            example: 7,
            type: 'integer',
            nullable: true,
            minimum: 0,
            maximum: 2147483647, // Postgres' max integer: https://www.postgresql.org/docs/9.1/datatype-numeric.html
        },
    },
    components: {},
} as const;

export type UpdateFeatureTypeLifetimeSchema = FromSchema<
    typeof updateFeatureTypeLifetimeSchema
>;
