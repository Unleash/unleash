import { FromQueryParams } from '../util/from-query-params';

export const exportQueryParameters = [
    {
        name: 'format',
        schema: {
            type: 'string',
            enum: ['json', 'yaml'],
            default: 'json',
        },
        description: 'Desired export format. Must be either `json` or `yaml`.',
        in: 'query',
    },
    {
        name: 'download',
        schema: {
            default: false,
            type: 'boolean',
        },
        description: 'Whether exported data should be downloaded as a file.',
        in: 'query',
    },
    {
        name: 'strategies',
        schema: {
            default: true,
            type: 'boolean',
        },
        description:
            'Whether strategies should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'featureToggles',
        schema: {
            type: 'boolean',
            default: true,
        },
        description:
            'Whether feature toggles should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'projects',
        schema: {
            type: 'boolean',
            default: true,
        },
        description:
            'Whether projects should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'tags',
        schema: {
            type: 'boolean',
            default: true,
        },
        description:
            'Whether tag types, tags, and feature_tags should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'environments',
        schema: {
            type: 'boolean',
            default: true,
        },
        description:
            'Whether environments should be included in the exported data.',
        in: 'query',
    },
] as const;

export type ExportQueryParameters = FromQueryParams<
    typeof exportQueryParameters
>;
