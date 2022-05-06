import { createSchemaObject, CreateSchemaType } from '../types';
import { parametersSchema } from './parameters-schema';
import { constraintSchema } from './constraint-schema';

const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
        },
        sortOrder: {
            type: 'number',
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

export type CreateStrategySchema = CreateSchemaType<typeof schema>;

const { 'components/schemas': componentsSchemas, ...rest } = schema;
export const createStrategySchema = createSchemaObject(rest);
