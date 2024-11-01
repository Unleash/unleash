import type { FromSchema } from 'json-schema-to-ts';

export const aiChatNewMessageSchema = {
    $id: '#/components/schemas/aiChatNewMessageSchema',
    type: 'object',
    description: 'Describes a new Unleash AI chat message sent by the user.',
    required: ['message'],
    properties: {
        message: {
            type: 'string',
            description: 'The message content.',
            example: 'What is your purpose?',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type AIChatNewMessageSchema = FromSchema<typeof aiChatNewMessageSchema>;
