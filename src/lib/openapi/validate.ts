import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaId, schemas } from './index';
import { omitKeys } from '../util/omit-keys';

interface ISchemaValidationErrors {
    schema: SchemaId;
    errors: ErrorObject[];
}

const ajv = new Ajv({
    schemas: Object.values(schemas).map((schema) =>
        omitKeys(schema, 'components'),
    ),
});

addFormats(ajv, ['date-time']);

// example was superseded by examples in openapi 3.1, but we're still on 3.0, so
// let's add it back in!
ajv.addKeyword('example');

export const validateSchema = (
    schema: SchemaId,
    data: unknown,
): ISchemaValidationErrors | undefined => {
    if (!ajv.validate(schema, data)) {
        return {
            schema,
            errors: ajv.errors ?? [],
        };
    }
};
