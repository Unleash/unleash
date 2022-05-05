import { createSchemaObject, CreateSchemaType } from '../types';

const valueSchema = {
    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'object' }],
};

export type PatchValueSchema = CreateSchemaType<typeof valueSchema>;
export const patchValueSchema = createSchemaObject(valueSchema);

const addOperationSchema = {
    type: 'object',
    required: ['path', 'op', 'value'],
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['add'],
        },
        value: patchValueSchema,
    },
} as const;

export type PatchAddOperationSchema = CreateSchemaType<
    typeof addOperationSchema
>;
export const patchAddOperationSchema = createSchemaObject(addOperationSchema);

const removeOperationSchema = {
    type: 'object',
    required: ['path', 'op'],
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['remove'],
        },
    },
} as const;

export type PatchRemoveOperationSchema = CreateSchemaType<
    typeof removeOperationSchema
>;
export const patchRemoveOperationSchema = createSchemaObject(
    removeOperationSchema,
);

const replaceOperationSchema = {
    type: 'object',
    required: ['path', 'op', 'value'],
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['replace'],
        },
        value: patchValueSchema,
    },
} as const;

export type PatchReplaceOperationSchema = CreateSchemaType<
    typeof replaceOperationSchema
>;
export const patchReplaceOperationSchema = createSchemaObject(
    replaceOperationSchema,
);

const moveOperationSchema = {
    type: 'object',
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['move'],
        },
        from: {
            type: 'string',
        },
    },
} as const;

export type PatchMoveOperationSchema = CreateSchemaType<
    typeof moveOperationSchema
>;
export const patchMoveOperationSchema = createSchemaObject(moveOperationSchema);

const copyOperationSchema = {
    type: 'object',
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['copy'],
        },
        from: {
            type: 'string',
        },
    },
} as const;

export type PatchCopyOperationSchema = CreateSchemaType<
    typeof copyOperationSchema
>;
export const patchCopyOperationSchema = createSchemaObject(copyOperationSchema);

const schema = {
    type: 'object',
    oneOf: [
        patchAddOperationSchema,
        patchRemoveOperationSchema,
        patchReplaceOperationSchema,
        patchMoveOperationSchema,
        patchCopyOperationSchema,
    ],
    discriminator: {
        propertyName: 'op',
    },
} as const;

export type PatchOperationSchema = CreateSchemaType<typeof schema>;

export const patchOperationSchema = createSchemaObject(schema);
