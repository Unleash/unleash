import type { OpenAPIV3 } from 'openapi-types';

export const projectFeaturesQueryParameters: OpenAPIV3.ParameterObject[] = [
    {
        name: 'view',
        in: 'query',
        required: false,
        description:
            'Experimental: `core` returns a lightweight version of each feature with `environments` empty and `favorite` set to `false`; it cannot be combined with the `tag` or `namePrefix` filters. Omit it to get the full feature overview. This parameter may change or be removed in a future release.',
        schema: { type: 'string', enum: ['core'] },
        example: 'core',
    },
];
