import { FromSchema } from 'json-schema-to-ts';
import { parameterDefinitionSchema } from './parameter-definition-schema';
import { tagTypeSchema } from './tag-type-schema';

export const addonDefinitionSchema = {
    $id: '#/components/schemas/addonDefinitionSchema',
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
            $ref: '#/components/schemas/parameterDefinitionSchema',
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
            parameterDefinitionSchema,
            tagTypeSchema,
        },
    },
} as const;
export type AddonDefinitionSchema = FromSchema<typeof addonDefinitionSchema>;
