import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { OpenAPIV3 } from 'openapi-types';

interface ISchemaValidationErrors {
    schema: OpenAPIV3.SchemaObject;
    data: unknown;
    errors: ErrorObject[];
}

const cache = new WeakMap<OpenAPIV3.SchemaObject, ValidateFunction>();
const ajv = new Ajv();

addFormats(ajv, ['date-time']);

export const validateJsonSchema = (
    schema: OpenAPIV3.SchemaObject,
    data: unknown,
): ISchemaValidationErrors | undefined => {
    if (!cache.has(schema)) {
        cache.set(schema, ajv.compile(schema));
    }

    const validate = cache.get(schema);

    if (!validate(data)) {
        return {
            schema,
            data: data,
            errors: validate.errors,
        };
    }
};
