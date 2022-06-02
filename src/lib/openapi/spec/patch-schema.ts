import { createSchemaObject, CreateSchemaType } from '../schema';

const schema = {
    type: 'object',
    required: ['path', 'op'],
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['add', 'remove', 'replace', 'copy', 'move'],
        },
        from: {
            type: 'string',
        },
        value: {},
    },
} as const;

export type PatchSchema = CreateSchemaType<typeof schema>;

export const patchSchema = createSchemaObject(schema);
