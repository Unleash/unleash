import { createSchemaObject, CreateSchemaType } from '../schema';

const schema = {
    type: 'object',
    description: 'OK',
} as const;

export type EmptyResponseSchema = CreateSchemaType<typeof schema>;

export const emptyResponseSchema = createSchemaObject(schema);
