import type { FromSchema } from 'json-schema-to-ts';

export const aiChatMessageSchema = {
    $id: '#/components/schemas/aiChatMessageSchema',
    type: 'object',
    description: 'Describes an Unleash AI chat message.',
    required: ['role', 'content'],
    properties: {
        role: {
            type: 'string',
            enum: ['system', 'user', 'assistant'],
            description: 'The role of the message sender.',
            example: 'user',
        },
        content: {
            type: 'string',
            description: 'The message content.',
            example: 'What is your purpose?',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type AIChatMessageSchema = FromSchema<typeof aiChatMessageSchema>;
