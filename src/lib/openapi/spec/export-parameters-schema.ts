import { FromSchema } from 'json-schema-to-ts';

export const exportParametersSchema = {
    $id: '#/components/schemas/exportParametersSchema',
    type: 'object',
    properties: {
        format: {
            type: 'string',
        },
        download: {
            type: 'boolean',
        },
        strategies: {
            type: 'boolean',
        },
        featureToggles: {
            type: 'boolean',
        },
        projects: {
            type: 'boolean',
        },
        tags: {
            type: 'boolean',
        },
        environments: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type ExportParametersSchema = FromSchema<typeof exportParametersSchema>;
