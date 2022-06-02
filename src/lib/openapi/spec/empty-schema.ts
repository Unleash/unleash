import { createSchemaObject, CreateSchemaType } from '../schema';

const schema = {
    type: 'object',
    description: 'emptySchema',
} as const;

export type EmptySchema = CreateSchemaType<typeof schema>;

export const emptySchema = createSchemaObject(schema);
