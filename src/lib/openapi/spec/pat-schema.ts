import { FromSchema } from 'json-schema-to-ts';

export const patSchema = {
    $id: '#/components/schemas/patSchema',
    type: 'object',
    description:
        'An overview of a [Personal Access Token](https://docs.getunleash.io/how-to/how-to-create-personal-access-tokens).',
    properties: {
        id: {
            type: 'integer',
            description:
                'The unique identification number for this Personal Access Token.',
            example: 1,
            minimum: 1,
        },
        secret: {
            type: 'string',
            description: 'The token used for authentication.',
            example: 'user:xyzrandomstring',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: `The token's expiration date.`,
            example: '2023-04-19T08:15:14.000Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-04-19T08:15:14.000Z',
            description: 'When the token was created.',
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-04-19T08:15:14.000Z',
            description:
                'When the token was last seen/used to authenticate with.',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type PatSchema = FromSchema<typeof patSchema>;
