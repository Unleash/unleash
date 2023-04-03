import { FromSchema } from 'json-schema-to-ts';

export const environmentProjectSchema = {
    $id: '#/components/schemas/environmentProjectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'type', 'enabled'],
    properties: {
        name: {
            type: 'string',
            example: 'development',
            description: 'The name of the environment',
        },
        type: {
            type: 'string',
            example: 'production',
            description:
                'The type of environment. Typically either development (non-production) or production',
        },
        enabled: {
            type: 'boolean',
            example: true,
            description:
                '`true` if the environment is enabled for the project, otherwise `false`',
        },
        protected: {
            type: 'boolean',
            example: false,
            description:
                '`true` if the environment is not removable, otherwise `false`',
        },
        sortOrder: {
            type: 'number',
            example: 1,
            description:
                'Priority of the environment in a list of environments, the lower value, the higher up in the list the environment will appear',
        },
        projectApiTokenCount: {
            type: 'number',
            nullable: true,
            description: 'How many API tokens are register',
        },
        projectEnabledToggleCount: {
            type: 'number',
            nullable: true,
        },
    },
    components: {},
} as const;

export type EnvironmentProjectSchema = FromSchema<
    typeof environmentProjectSchema
>;
