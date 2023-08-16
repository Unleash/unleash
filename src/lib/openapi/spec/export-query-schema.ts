import { FromSchema } from 'json-schema-to-ts';

export const exportQuerySchema = {
    $id: '#/components/schemas/exportQuerySchema',
    type: 'object',
    required: ['environment'],
    description:
        'Available query parameters for  the [deprecated export/import](https://docs.getunleash.io/reference/deploy/import-export) functionality.',
    properties: {
        environment: {
            type: 'string',
            example: 'development',
            description: 'The environment to export from',
        },
        downloadFile: {
            type: 'boolean',
            example: true,
            description: 'Whether to return a downloadable file',
        },
    },
    oneOf: [
        {
            required: ['features'],
            properties: {
                features: {
                    type: 'array',
                    example: ['MyAwesomeFeature'],
                    items: {
                        type: 'string',
                        minLength: 1,
                    },
                    description: 'Selects features to export by name.',
                },
            },
        },
        {
            required: ['tag'],
            properties: {
                tag: {
                    type: 'string',
                    example: 'release',
                    description:
                        'Selects features to export by tag. Takes precedence over the features field.',
                },
            },
        },
    ],
    components: {
        schemas: {},
    },
} as const;

export type ExportQuerySchema = FromSchema<typeof exportQuerySchema>;
