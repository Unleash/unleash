import { createSchemaObject, CreateSchemaType } from '../schema';

const schema = {
    type: 'object',
    additionalProperties: {
        type: 'string',
    },
} as const;

export type ParametersSchema = CreateSchemaType<typeof schema>;

export const parametersSchema = createSchemaObject(schema);
