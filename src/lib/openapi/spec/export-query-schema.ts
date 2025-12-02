import type { FromSchema } from 'json-schema-to-ts';

const commonProps = {
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
} as const;

export const exportQuerySchema = {
    $id: '#/components/schemas/exportQuerySchema',
    type: 'object',
    description:
        'Available query parameters for  the deprecated export/import functionality.',
    anyOf: [
        {
            required: ['environment', 'features'],
            properties: {
                ...commonProps,
                features: {
                    type: 'array',
                    example: ['MyAwesomeFeature'],
                    items: {
                        type: 'string',
                        minLength: 1,
                    },
                    description:
                        'Selects features to export by name. If the list is empty all features are returned.',
                },
            },
        },
        {
            required: ['environment', 'tag'],
            properties: {
                ...commonProps,
                tag: {
                    type: 'string',
                    example: 'release',
                    description: 'Selects features to export by tag.',
                },
            },
        },
        {
            required: ['environment', 'project'],
            properties: {
                ...commonProps,
                project: {
                    type: 'string',
                    example: 'my-project',
                    description:
                        'Selects project to export the features from. Used when no tags or features are provided.',
                },
            },
        },
    ],
    components: {
        schemas: {},
    },
} as const;

export type ExportQuerySchema = FromSchema<typeof exportQuerySchema>;
