import { SchemaObject } from 'ajv';
import fc from 'fast-check';
import { createRequestParameters } from './request-parameters';

describe('request parameter utils', () => {
    it('turns an object of names and descriptions into a an expected parameter list', () => {
        fc.assert(
            fc.property(
                fc.dictionary(fc.string({ minLength: 1 }), fc.string()),
                (parameters) => {
                    const result = createRequestParameters(parameters);

                    return result.every((paramsObject) => {
                        return (
                            paramsObject.description ===
                            parameters[paramsObject.name]
                        );
                    });
                },
            ),
        );
    });

    it('says every parameter is of type string and goes in the query', () => {
        fc.assert(
            fc.property(
                fc.dictionary(fc.string({ minLength: 1 }), fc.string()),

                (parameters) => {
                    return createRequestParameters(parameters).every(
                        (paramsObject) =>
                            (paramsObject.schema as SchemaObject).type ===
                                'string' && paramsObject.in === 'query',
                    );
                },
            ),
        );
    });
});
