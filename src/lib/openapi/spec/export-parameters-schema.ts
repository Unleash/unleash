import { FromSchema } from 'json-schema-to-ts';

const exportParameters = {
    format: {
        type: 'string',
        enum: ['json', 'yaml'],
        default: 'json',
        description: '',
    },
    download: {
        type: 'boolean',
        default: 'false',
        description: '',
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
};

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
