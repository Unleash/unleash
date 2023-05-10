import { FromSchema } from 'json-schema-to-ts';
import { createFeatureStrategySchema } from './create-feature-strategy-schema';

export const environmentProjectSchema = {
    $id: '#/components/schemas/environmentProjectSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name', 'type', 'enabled', 'protected', 'sortOrder'],
    description: "Describes a project's configuration in a given environment.",
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
                'The [type of environment](https://docs.getunleash.io/reference/environments#environment-types).',
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
                '`true` if the environment is protected, otherwise `false`. A *protected* environment can not be deleted.',
        },
        sortOrder: {
            type: 'integer',
            example: 1,
            description:
                'Priority of the environment in a list of environments, the lower the value, the higher up in the list the environment will appear',
        },
        projectApiTokenCount: {
            type: 'integer',
            minimum: 0,
            example: 5,
            description:
                'The number of client and front-end API tokens that have access to this project',
        },
        projectEnabledToggleCount: {
            type: 'integer',
            minimum: 0,
            example: 7,
            description:
                'The number of features enabled in this environment for this project',
        },
        defaultStrategy: {
            description:
                'The strategy configuration to add when enabling a feature environment by default',
            $ref: '#/components/schemas/createFeatureStrategySchema',
        },
    },
    components: {
        schemas: {
            createFeatureStrategySchema,
        },
    },
} as const;

export type EnvironmentProjectSchema = FromSchema<
    typeof environmentProjectSchema
>;
