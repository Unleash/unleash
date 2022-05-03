import { createSchemaObject, CreateSchemaType } from '../types';

const schema = {
    type: 'object',
    additionalProperties: {
        type: 'string',
    },
} as const;

export type ParametersSchema = CreateSchemaType<typeof schema>;

export const parametersSchema = createSchemaObject(schema);
