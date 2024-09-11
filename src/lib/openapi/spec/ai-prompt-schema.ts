import type { FromSchema } from 'json-schema-to-ts';

export const aiPromptSchema = {
    $id: '#/components/schemas/aiPromptSchema',
    type: 'object',
    description: 'Describes an Unleash AI prompt.',
    required: ['messages'],
    properties: {
        messages: {
            type: 'array',
            description:
                'The messages exchanged between the user and the Unleash AI.',
            items: {
                type: 'object',
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
            },
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type AIPromptSchema = FromSchema<typeof aiPromptSchema>;
