import { createSchemaObject, CreateSchemaType } from '../types';
import { constraintSchema } from './constraint-schema';
import { parametersSchema } from './parameters-schema';

export const strategySchemaDefinition = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'constraints', 'parameters'],
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        constraints: {
            type: 'array',
            items: { $ref: '#/components/schemas/constraintSchema' },
        },
        parameters: { $ref: '#/components/schemas/parametersSchema' },
    },
    'components/schemas': {
        constraintSchema: constraintSchema,
        parametersSchema: parametersSchema,
    },
} as const;

export type StrategySchema = CreateSchemaType<typeof strategySchemaDefinition>;
const { 'components/schemas': componentsSchemas, ...rest } =
    strategySchemaDefinition;

export const strategySchema = createSchemaObject(rest);
