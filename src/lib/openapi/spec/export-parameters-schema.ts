import { FromSchema } from 'json-schema-to-ts';
import { createQueryParameters } from '../util/query-parameters';
import { Parameters } from '../util/query-parameters';

const exportParameters: Parameters = {
    format: {
        type: 'string',
        enum: ['json', 'yaml'],
        default: 'json',
        description: 'Desired export format. Must be either `json` or `yaml`.',
    },
    download: {
        type: 'boolean',
        default: false,
        description: 'Whether exported data should be downloaded as a file.',
    },
    strategies: {
        type: 'boolean',
        default: true,
        description:
            'Whether strategies should be included in the exported data.',
    },
    featureToggles: {
        type: 'boolean',
        default: true,
        description:
            'Whether feature toggles should be included in the exported data.',
    },
    projects: {
        type: 'boolean',
        default: true,
        description:
            'Whether projects should be included in the exported data.',
    },
    tags: {
        type: 'boolean',
        default: true,
        description:
            'Whether tag types, tags, and feature_tags should be included in the exported data.',
    },
    environments: {
        type: 'boolean',
        default: true,
        description:
            'Whether environments should be included in the exported data.',
    },
};

export const exportQueryParameters = createQueryParameters(exportParameters);

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
