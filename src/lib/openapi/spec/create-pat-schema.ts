import type { FromSchema } from 'json-schema-to-ts';

export const createPatSchema = {
    $id: '#/components/schemas/createPatSchema',
    description:
        'Describes the properties required to create a [personal access token](https://docs.getunleash.io/concepts/api-tokens-and-client-keys#personal-access-tokens), or PAT. PATs are automatically scoped to the authenticated user.',
    type: 'object',
    required: ['description', 'expiresAt'],
    properties: {
        description: {
            type: 'string',
            description: `The PAT's description.`,
            example: 'user:xyzrandomstring',
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            description: `The PAT's expiration date.`,
            example: '2023-04-19T08:15:14.000Z',
        },
    },
    components: {},
} as const;

export type CreatePatSchema = FromSchema<typeof createPatSchema>;
