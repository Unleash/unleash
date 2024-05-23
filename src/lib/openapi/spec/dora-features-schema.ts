import type { FromSchema } from 'json-schema-to-ts';

export const doraFeaturesSchema = {
    $id: '#/components/schemas/doraFeaturesSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'timeToProduction'],
    description:
        'The representation of a dora time to production feature metric',
    properties: {
        name: {
            type: 'string',
            description: 'The name of a feature flag',
        },
        timeToProduction: {
            type: 'number',
            description:
                'The average number of days it takes a feature flag to get into production',
        },
    },
    components: {},
} as const;

export type DoraFeaturesSchema = FromSchema<typeof doraFeaturesSchema>;
