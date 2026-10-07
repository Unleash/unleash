import type { FromSchema } from 'json-schema-to-ts';

export const upsertPayloadSchemaSchema = {
    $id: '#/components/schemas/upsertPayloadSchemaSchema',
    type: 'object',
    required: ['schema'],
    description:
        'The schema that the variant payloads of a feature flag have to match.',
    properties: {
        schema: {
            type: 'object',
            additionalProperties: {},
            description:
                'A JSON Schema document. It replaces the schema the flag already has, if any.',
            example: {
                type: 'object',
                properties: { model: { type: 'string' } },
                required: ['model'],
            },
        },
    },
    components: {},
} as const;

export type UpsertPayloadSchemaSchema = FromSchema<
    typeof upsertPayloadSchemaSchema
>;
