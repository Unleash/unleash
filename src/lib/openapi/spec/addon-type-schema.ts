import { FromSchema } from 'json-schema-to-ts';
import { addonParameterSchema } from './addon-parameter-schema';
import { tagTypeSchema } from './tag-type-schema';

export const addonTypeSchema = {
    $id: '#/components/schemas/addonTypeSchema',
    type: 'object',
    required: ['name', 'displayName', 'documentationUrl', 'description'],
    properties: {
        name: {
            type: 'string',
        },
        displayName: {
            type: 'string',
        },
        documentationUrl: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        tagTypes: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/tagTypeSchema',
            },
        },
        parameters: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/addonParameterSchema',
            },
        },
        events: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    components: {
        schemas: {
            tagTypeSchema,
            addonParameterSchema,
        },
    },
} as const;

export type AddonTypeSchema = FromSchema<typeof addonTypeSchema>;
