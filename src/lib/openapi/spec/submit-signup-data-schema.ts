import type { FromSchema } from 'json-schema-to-ts';
import { signupDataSchema } from './signup-data-schema.js';

const { shouldSetPassword, ...commonSignupDataProperties } =
    signupDataSchema.properties;

export const submitSignupDataSchema = {
    $id: '#/components/schemas/submitSignupDataSchema',
    type: 'object',
    description:
        'An object describing the user and company signup data submission.',
    additionalProperties: false,
    properties: {
        ...commonSignupDataProperties,
        password: {
            type: 'string',
            example: 'k!5As3HquUrQ',
            description: `The user's new password.`,
        },
        inviteEmails: {
            type: 'array',
            description: 'A list of email addresses to invite.',
            items: {
                type: 'string',
            },
            example: ['marks@lumon.industries', 'hellyr@lumon.industries'],
        },
    },
    components: {},
} as const;

export type SubmitSignupDataSchema = FromSchema<typeof submitSignupDataSchema>;
