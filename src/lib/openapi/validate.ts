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
