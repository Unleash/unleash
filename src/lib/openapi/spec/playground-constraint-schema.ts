import { constraintSchemaBase } from './constraint-schema';
import { FromSchema } from 'json-schema-to-ts';

export const playgroundConstraintSchema = {
    $id: '#/components/schemas/playgroundConstraintSchema',
    additionalProperties: false,
    ...constraintSchemaBase,
    required: [...constraintSchemaBase.required, 'result'],
    properties: {
        ...constraintSchemaBase.properties,
        result: {
            description: 'Whether this was evaluated as true or false.',
            type: 'boolean',
        },
    },
} as const;

export type PlaygroundConstraintSchema = FromSchema<
    typeof playgroundConstraintSchema
>;
