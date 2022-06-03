import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaId, schemas } from './index';
import { omitKeys } from '../util/omit-keys';

interface ISchemaValidationErrors<T> {
    schema: SchemaId;
    data: T;
    errors: ErrorObject[];
}

const ajv = new Ajv({
    schemas: Object.values(schemas).map((schema) =>
        omitKeys(schema, 'components'),
    ),
});

addFormats(ajv, ['date-time']);

export const validateSchema = <T>(
    schema: SchemaId,
    data: T,
): ISchemaValidationErrors<T> | undefined => {
    if (!ajv.validate(schema, data)) {
        return {
            schema,
            data: data,
            errors: ajv.errors ?? [],
        };
    }
};
