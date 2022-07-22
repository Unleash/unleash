import { FromSchema } from 'json-schema-to-ts';
import { OpenAPIV3 } from 'openapi-types';
import { createQueryParameters } from '../util/query-parameters';

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

type ExportParameters = {
    [Property in keyof typeof exportParameters]: {
        type: typeof exportParameters[Property]['type'];
    };
};

// this schema is here only to generate types
const exportQueryParametersSchema = {
    $id: '#/components/schemas/exportQueryParameters',
    type: 'object',
    properties: createQueryParameters(exportParameters).reduce(
        (acc, next: OpenAPIV3.ParameterObject) => ({
            ...acc,
            [next.name]: {
                type: (next.schema as OpenAPIV3.SchemaObject).type,
            },
        }),
        {} as Partial<ExportParameters>,
    ) as ExportParameters,
} as const;

export type ExportQueryParameters = FromSchema<
    typeof exportQueryParametersSchema
>;

export const exportQueryParameters = createQueryParameters(exportParameters);
