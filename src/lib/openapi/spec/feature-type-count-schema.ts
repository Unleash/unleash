import type { FromSchema } from 'json-schema-to-ts';

export const featureTypeCountSchema = {
    $id: '#/components/schemas/featureTypeCountSchema',
    type: 'object',
    additionalProperties: false,
    required: ['type', 'count'],
    description: 'A count of feature flags of a specific type',
    properties: {
        type: {
            type: 'string',
            example: 'kill-switch',
            description:
                'Type of the flag e.g. experiment, kill-switch, release, operational, permission',
        },
        count: {
            type: 'number',
            example: 1,
            description: 'Number of feature flags of this type',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type FeatureTypeCountSchema = FromSchema<typeof featureTypeCountSchema>;
