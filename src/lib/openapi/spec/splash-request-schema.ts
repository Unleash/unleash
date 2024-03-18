import type { FromSchema } from 'json-schema-to-ts';

export const splashRequestSchema = {
    $id: '#/components/schemas/splashRequestSchema',
    type: 'object',
    description: 'Data related to a user having seen a splash screen.',
    required: ['userId', 'splashId'],
    properties: {
        userId: {
            type: 'integer',
            description: 'The ID of the user that was shown the splash screen.',
            example: 1,
        },
        splashId: {
            type: 'string',
            description: 'The ID of the splash screen that was shown.',
            example: 'new-splash-screen',
        },
    },
    components: {},
} as const;

export type SplashRequestSchema = FromSchema<typeof splashRequestSchema>;
