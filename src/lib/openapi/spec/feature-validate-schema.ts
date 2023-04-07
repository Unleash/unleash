import { FromSchema } from 'json-schema-to-ts';

export const featureValidateSchema = {
    $id: '#/components/schemas/featureValidateSchema',
    type: 'object',
    required: ['name'],
    properties: {
        name: {
            type: 'string',
            example: 'new-feature-name',
            description: 'Feature name to check',
        },
    },
    components: {},
} as const;

export type FeatureValidateSchema = FromSchema<typeof featureValidateSchema>;
