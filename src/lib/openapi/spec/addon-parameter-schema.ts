import { FromSchema } from 'json-schema-to-ts';

export const addonParameterSchema = {
    $id: '#/components/schemas/addonParameterSchema',
    type: 'object',
    required: ['name', 'displayName', 'type', 'required', 'sensitive'],
    properties: {
        name: {
            type: 'string',
        },
        displayName: {
            type: 'string',
        },
        type: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        placeholder: {
            type: 'string',
        },
        required: {
            type: 'boolean',
        },
        sensitive: {
            type: 'boolean',
        },
    },
    components: {},
} as const;

export type AddonParameterSchema = FromSchema<typeof addonParameterSchema>;
