import type { RequestHandler } from 'express';
import type { OpenAPIV3 } from 'openapi-types';

type Operation = OpenAPIV3.OperationObject;

const schemaStore = new WeakMap<RequestHandler, Operation>();

export const setSchema = (handler: RequestHandler, schema: Operation): void => {
    schemaStore.set(handler, schema);
};

export const getSchema = (handler: RequestHandler): Operation | undefined =>
    schemaStore.get(handler);
