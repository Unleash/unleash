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
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
        },
        description: 'Whether exported data should be downloaded as a file.',
        in: 'query',
    },
    {
        name: 'strategies',
        schema: {
            default: true,
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
        },
        description:
            'Whether strategies should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'featureToggles',
        schema: {
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
            default: true,
        },
        description:
            'Whether feature toggles should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'projects',
        schema: {
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
            default: true,
        },
        description:
            'Whether projects should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'tags',
        schema: {
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
            default: true,
        },
        description:
            'Whether tag types, tags, and feature_tags should be included in the exported data.',
        in: 'query',
    },
    {
        name: 'environments',
        schema: {
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                    minLength: 1,
                },
                {
                    type: 'number',
                },
            ],
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
