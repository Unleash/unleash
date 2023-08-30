import { FromSchema } from 'json-schema-to-ts';

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
        },
        timeToProduction: {
            type: 'number',
        },
    },
    components: {},
} as const;

export type DoraFeaturesSchema = FromSchema<typeof doraFeaturesSchema>;
