import type { FromSchema } from 'json-schema-to-ts';
import { aiChatMessageSchema } from './ai-chat-message-schema';

export const aiChatSchema = {
    $id: '#/components/schemas/aiChatSchema',
    type: 'object',
    description: 'Describes an Unleash AI chat.',
    required: ['messages'],
    properties: {
        messages: {
            type: 'array',
            description:
                'The messages exchanged between the user and the Unleash AI.',
            items: {
                $ref: '#/components/schemas/aiChatMessageSchema',
            },
        },
    },
    components: {
        schemas: {
            aiChatMessageSchema,
        },
    },
} as const;

export type AIChatSchema = FromSchema<typeof aiChatSchema>;
