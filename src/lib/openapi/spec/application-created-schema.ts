import type { FromSchema } from 'json-schema-to-ts';

export const applicationCreatedSchema = {
    $id: '#/components/schemas/applicationCreatedSchema',
    type: 'object',
    description: 'An application that was created in Unleash.',
    additionalProperties: false,
    required: ['appName', 'description', 'createdAt'],
    properties: {
        appName: {
            description: 'The name SDKs report and tokens link to.',
            type: 'string',
            example: 'checkout-service',
        },
        description: {
            description: 'What the application does.',
            type: 'string',
            nullable: true,
            example: 'Payment and basket service',
        },
        createdAt: {
            description: 'When the application was created.',
            type: 'string',
            format: 'date-time',
            example: '2026-11-20T09:12:00.000Z',
        },
    },
    components: {},
} as const;

export type ApplicationCreatedSchema = FromSchema<
    typeof applicationCreatedSchema
>;
