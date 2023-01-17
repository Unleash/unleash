import { FromSchema } from 'json-schema-to-ts';

export const exportQuerySchema = {
    $id: '#/components/schemas/exportQuerySchema',
    type: 'object',
    additionalProperties: false,
    required: ['features', 'environment'],
    properties: {
        features: {
            type: 'array',
            items: {
                type: 'string',
                minLength: 1,
            },
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
