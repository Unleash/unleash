import { createSchemaObject, CreateSchemaType } from '../types';

const schema = {
    type: 'object',
    additionalProperties: {
        type: 'string',
        maxLength: 100,
    },
} as const;

export type ParametersSchema = CreateSchemaType<typeof schema>;

export const parametersSchema = createSchemaObject(schema);
