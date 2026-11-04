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
        hearAboutUs: {
            type: 'string',
            description: 'How the user heard about Unleash.',
            example: 'Search Engine (Google, Bing, etc.)',
        },
        password: {
            type: 'string',
            example: 'k!5As3HquUrQ',
            description: `The user's new password.`,
        },
    },
    components: {},
} as const;

export type SubmitSignupDataSchema = FromSchema<typeof submitSignupDataSchema>;
