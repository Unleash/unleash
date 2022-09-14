import { FromQueryParams } from '../util/from-query-params';

// NOTE: Disabled default parameter values
//
// These query parameters all have default values that get set by the API.
// However, our validation testing using the OpenAPI enforcer library deems
// these to be invalid. This is probably because we're trying to assign default
// values to a value that can be of multiple types.
//
// So to get around this for now, I have commented out the default values and
// added a note to the description instead. I have also opened an issue on the
// GitHub repo and am awaiting a response.
//
// GitHub issue: https://github.com/Gi60s/openapi-enforcer/issues/145
//
// In the meantime, if you think it's just that I have the format wrong, please
// go ahead and try and correct it! If it turns out that it's on our end then we
// can get it out of the way sooner 😄

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
            // default: false, <— refer to the comment at the top of the file
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
            'Whether exported data should be downloaded as a file. Defaults to `false`.',
        in: 'query',
    },
    {
        name: 'strategies',
        schema: {
            // default: true, <— refer to the comment at the top of the file
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
            'Whether strategies should be included in the exported data. Defaults to `true`.',
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
            // default: true, <-- refer to the comment at the top of the file
        },
        description:
            'Whether feature toggles should be included in the exported data. Defaults to `true`.',
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
            // default: true, <-- refer to the comment at the top of the file
        },
        description:
            'Whether projects should be included in the exported data. Defaults to `true`.',
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
            // default: true, <-- refer to the comment at the top of the file
        },
        description:
            'Whether tag types, tags, and feature_tags should be included in the exported data. Defaults to `true`.',
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
            // default: true, <-- refer to the comment at the top of the file
        },
        description:
            'Whether environments should be included in the exported data. Defaults to `true`.',
        in: 'query',
    },
] as const;

export type ExportQueryParameters = FromQueryParams<
    typeof exportQueryParameters
>;
