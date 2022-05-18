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
export type CreateSchemaType<T> = FromSchema<
    T,
    {
        definitionsPath: 'components/schemas';
        deserialize: [
            {
                pattern: {
                    type: 'string';
                    format: 'date';
                };
                output: Date;
            },
        ];
    }
>;

// Create an OpenAPIV3.SchemaObject from a const schema object.
// Make sure the schema contains an object of refs for type generation.
// Pass an empty 'components/schemas' object if there are no refs in the schema.
// Note: The order of the refs must match the order they are present in the object
export const createSchemaObject = <
    T extends { 'components/schemas': { [key: string]: object } },
>(
    schema: T,
): DeepMutable<Omit<T, 'components/schemas'>> => {
    const { 'components/schemas': schemas, ...rest } = schema;
    return rest;
};
