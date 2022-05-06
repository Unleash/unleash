import { createSchemaObject, CreateSchemaType } from '../types';

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
        value: {},
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
        value: {},
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
    required: ['path', 'op', 'from'],
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
    required: ['path', 'op', 'from'],
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
    anyOf: [
        { $ref: '#/components/schemas/patchAddOperationSchema' },
        { $ref: '#/components/schemas/patchRemoveOperationSchema' },
        { $ref: '#/components/schemas/patchReplaceOperationSchema' },
        { $ref: '#/components/schemas/patchMoveOperationSchema' },
        { $ref: '#/components/schemas/patchCopyOperationSchema' },
    ],
    'components/schemas': {
        patchAddOperationSchema: patchAddOperationSchema,
        patchRemoveOperationSchema: patchRemoveOperationSchema,
        patchReplaceOperationSchema: patchReplaceOperationSchema,
        patchMoveOperationSchema: patchMoveOperationSchema,
        patchCopyOperationSchema: patchCopyOperationSchema,
    },
} as const;

export type PatchOperationSchema = CreateSchemaType<typeof schema>;
const { 'components/schemas': componentsSchemas, ...operationRest } = schema;
export const patchOperationSchema = createSchemaObject(operationRest);
