import Ajv, { ErrorObject } from 'ajv';
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

    // example was superseded by examples in openapi 3.1, but we're still on 3.0, so
    // let's add it back in!
    keywords: ['example'],
    formats: {
        'date-time': true,
        uri: true,
    },
});

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
