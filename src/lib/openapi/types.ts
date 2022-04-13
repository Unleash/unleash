import { OpenAPIV3 } from 'openapi-types';
import { FromSchema } from 'json-schema-to-ts';
import { DeepMutable } from '../types/mutable';

// Admin paths must have the "admin" tag.
export interface AdminApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['admin'];
}

// Client paths must have the "client" tag.
export interface ClientApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['client'];
}

// Create a type from a const schema object.
export type CreateSchemaType<T> = FromSchema<T>;

// Create an OpenAPIV3.SchemaObject from a const schema object.
export const createSchemaObject = <T>(schema: T): DeepMutable<T> => schema;
