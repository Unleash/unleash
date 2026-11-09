import type { FromSchema } from 'json-schema-to-ts';
import { groupSchema } from './group-schema.js';

const { users, ...groupWriteResponseProperties } = groupSchema.properties;

export const groupWriteResponseSchema = {
    $id: '#/components/schemas/groupWriteResponseSchema',
    type: 'object',
    additionalProperties: false,
    required: ['name'],
    description:
        'A user group returned after create or update. User membership is intentionally omitted; fetch the group resource when membership details are needed.',
    properties: groupWriteResponseProperties,
    components: groupSchema.components,
} as const;

export type GroupWriteResponseSchema = FromSchema<
    typeof groupWriteResponseSchema
>;
