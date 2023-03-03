import { FromSchema } from 'json-schema-to-ts';
import { importTogglesValidateItemSchema } from './import-toggles-validate-item-schema';

export const importTogglesValidateSchema = {
    $id: '#/components/schemas/importTogglesValidateSchema',
    type: 'object',
    required: ['errors', 'warnings'],
    additionalProperties: false,
    properties: {
        errors: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/importTogglesValidateItemSchema',
            },
        },
        warnings: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/importTogglesValidateItemSchema',
            },
        },
        permissions: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/importTogglesValidateItemSchema',
            },
        },
    },
    components: {
        schemas: {
            importTogglesValidateItemSchema,
        },
    },
} as const;

export type ImportTogglesValidateSchema = FromSchema<
    typeof importTogglesValidateSchema
>;
