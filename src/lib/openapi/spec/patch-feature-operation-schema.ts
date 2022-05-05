import { createSchemaObject, CreateSchemaType } from '../types';
import { featureSchema } from './feature-schema';

//Base Operation
let baseOperationSchema = {
    type: 'object',
    required: ['path'],
    properties: {
        path: {
            type: 'string',
        },
    },
} as const;

export type PatchFeatureBaseOperationSchema = CreateSchemaType<
    typeof baseOperationSchema
>;
export const patchFeatureBaseOperationSchema =
    createSchemaObject(baseOperationSchema);

//Add operation
const addOperationSchema = {
    type: 'object',
    required: ['path', 'op', 'value'],
    allOf: {
        $ref: baseOperationSchema,
    },
    properties: {
        op: {
            type: 'string',
            enum: ['add'],
        },
        value: featureSchema,
    },
} as const;

export type PatchFeatureAddOperationSchema = CreateSchemaType<
    typeof addOperationSchema
>;
export const patchFeatureAddOperationSchema =
    createSchemaObject(addOperationSchema);

//Remove operation
const removeOperationSchema = {
    type: 'object',
    required: ['path', 'op'],
    allOf: {
        $ref: baseOperationSchema,
    },
    properties: {
        op: {
            type: 'string',
            enum: ['remove'],
        },
    },
} as const;

export type PatchFeatureRemoveOperationSchema = CreateSchemaType<
    typeof removeOperationSchema
>;
export const patchFeatureRemoveOperationSchema = createSchemaObject(
    removeOperationSchema,
);

//Replace Operation
const replaceOperationSchema = {
    type: 'object',
    allOf: {
        $ref: baseOperationSchema,
    },
    required: ['path', 'op', 'value'],
    properties: {
        op: {
            type: 'string',
            enum: ['replace'],
        },
        value: featureSchema,
    },
} as const;

export type PatchFeatureReplaceOperationSchema = CreateSchemaType<
    typeof replaceOperationSchema
>;
export const patchFeatureReplaceOperationSchema = createSchemaObject(
    replaceOperationSchema,
);

//Move Operation
const moveOperationSchema = {
    type: 'object',
    allOf: {
        $ref: baseOperationSchema,
    },
    properties: {
        op: {
            type: 'string',
            enum: ['move'],
        },
        from: {
            type: 'string',
        },
    },
} as const;

export type PatchFeatureMoveOperationSchema = CreateSchemaType<
    typeof moveOperationSchema
>;
export const patchFeatureMoveOperationSchema =
    createSchemaObject(moveOperationSchema);

//Copy Operation
const copyOperationSchema = {
    type: 'object',
    allOf: {
        $ref: baseOperationSchema,
    },
    properties: {
        op: {
            type: 'string',
            enum: ['copy'],
        },
        from: {
            type: 'string',
        },
    },
} as const;

export type PatchFeatureCopyOperationSchema = CreateSchemaType<
    typeof copyOperationSchema
>;
export const patchFeatureCopyOperationSchema =
    createSchemaObject(copyOperationSchema);

//Test Operation
const testOperationSchema = {
    type: 'object',
    allOf: {
        $ref: baseOperationSchema,
    },
    properties: {
        op: {
            type: 'string',
            enum: ['test'],
        },
        value: featureSchema,
    },
} as const;

export type PatchFeatureTestOperationSchema = CreateSchemaType<
    typeof testOperationSchema
>;
export const patchFeatureTestOperationSchema =
    createSchemaObject(testOperationSchema);

//Get Operation
const getOperationSchema = {
    type: 'object',
    allOf: {
        $ref: baseOperationSchema,
    },
    required: ['path', 'op'],
    properties: {
        op: {
            type: 'string',
            enum: ['_get'],
        },
        value: featureSchema,
    },
} as const;

export type PatchFeatureGetOperationSchema = CreateSchemaType<
    typeof getOperationSchema
>;
export const patchFeatureGetOperationSchema =
    createSchemaObject(getOperationSchema);

const schema = {
    oneOf: [
        patchFeatureAddOperationSchema,
        patchFeatureRemoveOperationSchema,
        patchFeatureReplaceOperationSchema,
        patchFeatureMoveOperationSchema,
        patchFeatureCopyOperationSchema,
        patchFeatureTestOperationSchema,
        patchFeatureGetOperationSchema,
    ],
} as const;

export type PatchFeatureOperationSchema = CreateSchemaType<typeof schema>;

export const patchFeatureOperationSchema = createSchemaObject(schema);
