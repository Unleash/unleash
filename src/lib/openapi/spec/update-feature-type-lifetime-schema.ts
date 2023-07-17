import { FromSchema } from 'json-schema-to-ts';

export const updateFeatureTypeLifetimeSchema = {
    $id: '#/components/schemas/updateFeatureTypeLifetimeSchema',
    type: 'object',
    required: ['lifetime'],
    description:
        'Data used when updating the lifetime of a [feature toggle type](https://docs.getunleash.io/reference/feature-toggle-types).',
    properties: {
        updateFeatureTypeLifetime: {
            description:
                'The new lifetime (in days) that you want to assign to the feature toggle type. If the value is `null`, then the feature toggles of that type will never be marked as potentially stale. If the value is `0`, then Unleash will consider them potentially stale immediately. Otherwise, they will be considered potentially stale after the number of days indicated by this property.',
            example: '7',
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
