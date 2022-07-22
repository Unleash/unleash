import { FromSchema } from 'json-schema-to-ts';
import { OpenAPIV3 } from 'openapi-types';
import { createQueryParameters } from '../util/query-parameters';
import { Parameters } from '../util/query-parameters';

const exportParameters = {
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
} as const;

type ExportParams = typeof exportParameters;

type Mutable = {
    [Property in keyof ExportParams]: { type: ExportParams[Property]['type'] };
};

const p = {
    $id: 'th',
    type: 'object',
    properties: createQueryParameters(exportParameters).reduce(
        (acc, next: OpenAPIV3.ParameterObject) => ({
            ...acc,
            [next.name]: {
                type: (next.schema as OpenAPIV3.SchemaObject).type,
            },
        }),
        {} as Partial<Mutable>,
    ) as Mutable,
} as const;

export type ExpType = FromSchema<typeof p>;

export const exportQueryParameters = createQueryParameters(exportParameters);

const s = {
    $id: '#/components/schemas/exportParametersSchema2',
    parameters: [
        {
            name: 'format',
            description:
                'Desired export format. Must be either `json` or `yaml`.',
            schema: {
                type: 'string',
                enum: ['json', 'yaml'],
                default: 'json',
            },
            in: 'query',
        },
        {
            name: 'download',
            description:
                'Whether exported data should be downloaded as a file.',
            schema: {
                type: 'boolean',
                default: false,
            },
            in: 'query',
        },
        {
            name: 'strategies',
            description:
                'Whether strategies should be included in the exported data.',
            schema: {
                type: 'boolean',
                default: true,
            },
            in: 'query',
        },
        {
            name: 'featureToggles',
            description:
                'Whether feature toggles should be included in the exported data.',
            schema: {
                type: 'boolean',
                default: true,
            },
            in: 'query',
        },
        {
            name: 'projects',
            description:
                'Whether projects should be included in the exported data.',
            schema: {
                type: 'boolean',
                default: true,
            },
            in: 'query',
        },
        {
            name: 'tags',
            description:
                'Whether tag types, tags, and feature_tags should be included in the exported data.',
            schema: {
                type: 'boolean',
                default: true,
            },
            in: 'query',
        },
        {
            name: 'environments',
            description:
                'Whether environments should be included in the exported data.',
            schema: {
                type: 'boolean',
                default: true,
            },
            in: 'query',
        },
    ],
} as const;

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
