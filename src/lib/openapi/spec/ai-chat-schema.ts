import type { FromSchema } from 'json-schema-to-ts';
import { aiChatMessageSchema } from './ai-chat-message-schema';

export const aiChatSchema = {
    $id: '#/components/schemas/aiChatSchema',
    type: 'object',
    description: 'Describes an Unleash AI chat.',
    additionalProperties: false,
    required: ['id', 'userId', 'createdAt', 'messages'],
    properties: {
        id: {
            type: 'string',
            pattern: '^[0-9]+$', // BigInt
            description:
                "The chat's ID. Chat IDs are incrementing integers. In other words, a more recently created chat will always have a higher ID than an older one. This ID is represented as a string since it is a BigInt.",
            example: '7',
        },
        userId: {
            type: 'integer',
            description: 'The ID of the user that the chat belongs to.',
            example: 7,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time of when the chat was created.',
            example: '2023-12-27T13:37:00+01:00',
        },
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
