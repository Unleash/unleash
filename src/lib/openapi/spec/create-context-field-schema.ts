import type { FromSchema } from 'json-schema-to-ts';
import { updateContextFieldSchema } from './update-context-field-schema.js';

export const createContextFieldSchema = {
    ...updateContextFieldSchema,
    $id: '#/components/schemas/createContextFieldSchema',
    description: 'Data used to create a context field configuration.',
    required: ['name'],
    properties: {
        ...updateContextFieldSchema.properties,
        name: {
            description: 'The name of the context field.',
            type: 'string',
            example: 'subscriptionTier',
        },
        valueType: {
            type: 'string',
            nullable: true,
            enum: ['String', 'Number', 'Semver', 'Date'],
            example: 'String',
            description:
                'The type of the context field. Used to restrict the operators available for this field.',
        },
    },
} as const;

export type CreateContextFieldSchema = FromSchema<
    typeof createContextFieldSchema
>;
