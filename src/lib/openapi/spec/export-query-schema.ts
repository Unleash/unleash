import { FromSchema } from 'json-schema-to-ts';

export const exportQuerySchema = {
    $id: '#/components/schemas/exportQuerySchema',
    type: 'object',
    additionalProperties: true,
    required: ['environment'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
            description: 'Selects features to export by name.',
        },
        tag: {
            type: 'string',
            description:
                'Selects features to export by tag. Takes precedence over the features field.',
        },
        environment: {
            type: 'string',
        },
        downloadFile: {
            type: 'boolean',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type ExportQuerySchema = FromSchema<typeof exportQuerySchema>;
