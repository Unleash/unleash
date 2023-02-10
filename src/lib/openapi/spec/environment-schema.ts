import { FromSchema } from 'json-schema-to-ts';

export const environmentSchema = {
    $id: '#/components/schemas/environmentSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'type', 'enabled'],
    description: 'A definition of the project environment',
    properties: {
        name: {
            type: 'string',
            example: 'my-dev-env',
            description: 'The name of the environment',
        },
        type: {
            type: 'string',
            example: 'development',
            description: 'The type of the environment',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the environment is enabled for the project, otherwise `false`.',
        },
        protected: {
            type: 'boolean',
        },
        sortOrder: {
            type: 'number',
            example: 3,
            description:
                'The sort order where the lower the value the higher on the list it appears',
        },
        projectCount: {
            type: 'number',
            nullable: true,
            example: 10,
            description: 'The number of projects with this environment',
        },
        apiTokenCount: {
            type: 'number',
            nullable: true,
            example: 6,
            description: 'The number of API token for the project environment',
        },
        enabledToggleCount: {
            type: 'number',
            nullable: true,
            example: 10,
            description:
                'The number of enabled toggles for the project environment',
        },
    },
    components: {},
} as const;

export type EnvironmentSchema = FromSchema<typeof environmentSchema>;
