import type { FromSchema } from 'json-schema-to-ts';

export const setCorsSchema = {
    $id: '#/components/schemas/setCorsSchema',
    type: 'object',
    additionalProperties: false,
    description: 'Unleash CORS configuration.',
    properties: {
        frontendApiOrigins: {
            description:
                'The list of origins that the front-end API should accept requests from.',
            example: ['*'],
            type: 'array',
            items: { type: 'string' },
        },
    },
    components: {},
} as const;

export type SetCorsSchema = FromSchema<typeof setCorsSchema>;
