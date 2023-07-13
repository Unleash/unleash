import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { permissionSchema } from './permission-schema';
import { feedbackResponseSchema } from './feedback-response-schema';

export const meSchema = {
    $id: '#/components/schemas/meSchema',
    type: 'object',
    additionalProperties: false,
    required: ['user', 'permissions', 'feedback', 'splash'],
    description: 'Detailed user information',
    properties: {
        user: {
            $ref: '#/components/schemas/userSchema',
        },
        permissions: {
            description: 'User permissions for projects and environments',
            type: 'array',
            items: {
                $ref: '#/components/schemas/permissionSchema',
            },
        },
        feedback: {
            description: 'User feedback information',
            type: 'array',
            items: {
                $ref: '#/components/schemas/feedbackResponseSchema',
            },
        },
        splash: {
            description: 'Splash screen configuration',
            type: 'object',
            additionalProperties: {
                type: 'boolean',
            },
        },
    },
    components: {
        schemas: {
            userSchema,
            permissionSchema,
            feedbackResponseSchema,
        },
    },
} as const;

export type MeSchema = FromSchema<typeof meSchema>;
