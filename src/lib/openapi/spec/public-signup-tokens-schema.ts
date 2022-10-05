import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';
import { publicSignupTokenSchema } from './public-signup-token-schema';

export const publicSignupTokensSchema = {
    $id: '#/components/schemas/publicSignupTokensSchema',
    type: 'object',
    additionalProperties: false,
    required: ['tokens'],
    properties: {
        tokens: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/publicSignupTokenSchema',
            },
        },
    },
    example: {
        tokens: [
            {
                secret: 'ew395up3o39ncc9o',
                url: 'http://localhost:4242/invite-link/ew395up3o39ncc9o/signup',
                name: 'shared',
                expiresAt: '2022-09-15T09:09:09.194Z',
                createdAt: '2022-08-15T09:09:09.194Z',
                createdBy: 'Jack Doe',
                users: [
                    {
                        id: 0,
                        isAPI: true,
                        name: 'John Doe',
                        email: 'john@example.com',
                        username: 'BigJ',
                        imageUrl:
                            'https://gravatar.com/avatar/222f2ab70c039dda12e3d11acdcebd02?size=42&default=retro',
                        inviteLink: '',
                        loginAttempts: 0,
                        emailSent: true,
                        rootRole: 0,
                        seenAt: '2022-09-15T09:09:09.194Z',
                        createdAt: '2022-09-15T09:09:09.194Z',
                    },
                ],
                role: {
                    id: 0,
                    type: 'root',
                    name: 'Viewer',
                    description: 'Allows users to view',
                },
            },
        ],
    },
    components: {
        schemas: {
            publicSignupTokenSchema,
            userSchema,
            roleSchema,
        },
    },
} as const;

export type PublicSignupTokensSchema = FromSchema<
    typeof publicSignupTokensSchema
>;
