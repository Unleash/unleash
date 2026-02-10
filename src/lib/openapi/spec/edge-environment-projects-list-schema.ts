import type { FromSchema } from 'json-schema-to-ts';

export const edgeEnvironmentProjectsListSchema = {
    $id: '#/components/schemas/edgeEnvironmentProjectsListSchema',
    type: 'object',
    description:
        'Schema to request api tokens for a list of environment -> projects tuples',
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            description: 'A list of requested api tokens.',
            items: {
                type: 'object',
                additionalProperties: false,
                description:
                    'A list of requested environment -> projects tuples.',
                required: ['environment', 'projects'],
                properties: {
                    environment: {
                        type: 'string',
                        description: 'The name of an existing environment',
                        example: 'development',
                        nullable: false,
                    },
                    projects: {
                        type: 'array',
                        description: `The list of projects Edge wants access to, or '*' for a wildcard token`,
                        items: {
                            type: 'string',
                            example: 'default',
                        },
                        nullable: false,
                    },
                },
                nullable: false,
            },
            nullable: false,
        },
    },
    components: {},
} as const;

export type EdgeEnvironmentsProjectsListSchema = FromSchema<
    typeof edgeEnvironmentProjectsListSchema
>;
