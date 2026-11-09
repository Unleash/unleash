import type { OpenAPIV3 } from 'openapi-types';

export const projectsViewQueryParameter: OpenAPIV3.ParameterObject = {
    name: 'view',
    in: 'query',
    required: false,
    description:
        'Experimental: which shape of project to return. `core` returns only the fields stored on the project itself (id, name, description, createdAt, archivedAt) and skips the derived fields such as feature counts, member counts, owners and health. Omit it to get the full projects listing. This parameter may change or be removed in a future release.',
    schema: {
        type: 'string',
        enum: ['core'],
    },
    example: 'core',
};
