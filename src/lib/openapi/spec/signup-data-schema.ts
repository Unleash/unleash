import type { FromSchema } from 'json-schema-to-ts';

export const signupDataSchema = {
    $id: '#/components/schemas/signupDataSchema',
    type: 'object',
    description: 'An object describing the user and company signup data.',
    additionalProperties: false,
    properties: {
        shouldSetPassword: {
            type: 'boolean',
            description:
                'Whether the user should set a password as part of the signup process.',
            example: false,
        },
        name: {
            type: 'string',
            description: "The user's name.",
            example: 'Mark Scout',
        },
        companyRole: {
            type: 'string',
            description: 'The role of the user within the company.',
            example: 'Developer',
        },
        companyName: {
            type: 'string',
            description: 'The name of the company.',
            example: 'Lumon Industries',
        },
        companyIsNA: {
            type: 'boolean',
            description: 'Whether the company is based in North America.',
            example: true,
        },
        productUpdatesEmailConsent: {
            type: 'boolean',
            description:
                'Whether the user has consented to receive product update emails.',
            example: true,
        },
    },
    components: {},
} as const;

export type SignupDataSchema = FromSchema<typeof signupDataSchema>;
