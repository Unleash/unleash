import { createSchemaObject, CreateSchemaType } from '../types';
import { strategySchema } from './strategy-schema';

//Add operation
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
        value: strategySchema,
    },
} as const;

export type PatchStrategyAddOperationSchema = CreateSchemaType<
    typeof addOperationSchema
>;
export const patchStrategyAddOperationSchema =
    createSchemaObject(addOperationSchema);

//Remove operation
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

export type PatchStrategyRemoveOperationSchema = CreateSchemaType<
    typeof removeOperationSchema
>;
export const patchStrategyRemoveOperationSchema = createSchemaObject(
    removeOperationSchema,
);

//Replace Operation
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
        value: strategySchema,
    },
} as const;

export type PatchStrategyReplaceOperationSchema = CreateSchemaType<
    typeof replaceOperationSchema
>;
export const patchStrategyReplaceOperationSchema = createSchemaObject(
    replaceOperationSchema,
);

//Move Operation
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

export type PatchStrategyMoveOperationSchema = CreateSchemaType<
    typeof moveOperationSchema
>;
export const patchStrategyMoveOperationSchema =
    createSchemaObject(moveOperationSchema);

//Copy Operation
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

export type PatchStrategyCopyOperationSchema = CreateSchemaType<
    typeof copyOperationSchema
>;
export const patchStrategyCopyOperationSchema =
    createSchemaObject(copyOperationSchema);

//Test Operation
const testOperationSchema = {
    type: 'object',
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['test'],
        },
        value: strategySchema,
    },
} as const;

export type PatchStrategyTestOperationSchema = CreateSchemaType<
    typeof testOperationSchema
>;
export const patchStrategyTestOperationSchema =
    createSchemaObject(testOperationSchema);

//Get Operation
const getOperationSchema = {
    type: 'object',
    required: ['path', 'op'],
    properties: {
        path: {
            type: 'string',
        },
        op: {
            type: 'string',
            enum: ['_get'],
        },
        value: strategySchema,
    },
} as const;

export type PatchStrategyGetOperationSchema = CreateSchemaType<
    typeof getOperationSchema
>;
export const patchStrategyGetOperationSchema =
    createSchemaObject(getOperationSchema);

const schema = {
    type: 'object',
    oneOf: [
        patchStrategyAddOperationSchema,
        patchStrategyRemoveOperationSchema,
        patchStrategyReplaceOperationSchema,
        patchStrategyMoveOperationSchema,
        patchStrategyCopyOperationSchema,
        patchStrategyTestOperationSchema,
        patchStrategyGetOperationSchema,
    ],
    discriminator: {
        propertyName: 'op',
    },
} as const;

export type PatchStrategyOperationSchema = CreateSchemaType<typeof schema>;

export const patchStrategyOperationSchema = createSchemaObject(schema);
