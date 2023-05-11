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
                'The unique identification number for this Personal Access Token. (This property is set by Unleash when the token is created and cannot be set manually: if you provide a value when creating a PAT, Unleash will ignore it.)',
            example: 1,
            minimum: 1,
        },
        secret: {
            type: 'string',
            description:
                'The token used for authentication. (This property is set by Unleash when the token is created and cannot be set manually: if you provide a value when creating a PAT, Unleash will ignore it.)',
            example: 'user:xyzrandomstring',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            description: `The token's expiration date.`,
            example: '2023-04-19T08:15:14.000Z',
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-04-19T08:15:14.000Z',
            description:
                'When the token was created. (This property is set by Unleash when the token is created and cannot be set manually: if you provide a value when creating a PAT, Unleash will ignore it.)',
        },
        seenAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2023-04-19T08:15:14.000Z',
            description:
                'When the token was last seen/used to authenticate with. `null` if it has not been used yet. (This property is set by Unleash when the token is created and cannot be set manually: if you provide a value when creating a PAT, Unleash will ignore it.)',
        },
    },
    components: {
        schemas: {},
    },
} as const;

export type PatSchema = FromSchema<typeof patSchema>;
