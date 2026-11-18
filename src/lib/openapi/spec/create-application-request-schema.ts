import type { FromSchema } from 'json-schema-to-ts';

export const createApplicationRequestSchema = {
    $id: '#/components/schemas/createApplicationRequestSchema',
    type: 'object',
    description: 'An application to create before any SDK reports it.',
    required: ['appName'],
    properties: {
        appName: {
            description:
                'The name SDKs report and tokens link to. It can never change. Letters, digits, `.`, `_`, `~` and `-`, starting with a letter or digit.',
            type: 'string',
            pattern: '^[A-Za-z0-9][A-Za-z0-9._~-]*$',
            maxLength: 255,
            example: 'checkout-service',
        },
        description: {
            description: 'What the application does.',
            type: 'string',
            maxLength: 255,
            example: 'Payment and basket service',
        },
    },
    components: {},
} as const;

export type CreateApplicationRequestSchema = FromSchema<
    typeof createApplicationRequestSchema
>;
