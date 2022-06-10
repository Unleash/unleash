import { FromSchema } from 'json-schema-to-ts';

export const splashSchema = {
    $id: '#/components/schemas/splashSchema',
    type: 'object',
    additionalProperties: false,
    required: ['userId', 'splashId', 'seen'],
    properties: {
        userId: {
            type: 'number',
        },
        splashId: {
            type: 'string',
        },
        seen: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type SplashSchema = FromSchema<typeof splashSchema>;
