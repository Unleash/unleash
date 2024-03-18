import type { FromSchema } from 'json-schema-to-ts';

export const recordUiErrorSchema = {
    $id: '#/components/schemas/recordUiErrorSchema',
    type: 'object',
    components: {},
    required: ['errorMessage'],
    description: 'An object representing an error from the UI',
    properties: {
        errorMessage: {
            type: 'string',
            description: 'The error message',
        },
        errorStack: {
            type: 'string',
            description: 'The stack trace of the error',
        },
    },
} as const;

export type RecordUiErrorSchema = FromSchema<typeof recordUiErrorSchema>;
