import { constraintSchema } from './spec';
import { throwOnInvalidSchema, validateSchema } from './validate';

test('validateSchema', () => {
    expect(() => validateSchema('unknownSchemaId' as any, {})).toThrow(
        'no schema with key or ref "unknownSchemaId"',
    );
});

test('throwOnInvalidSchema', () => {
    expect(() =>
        throwOnInvalidSchema(constraintSchema.$id, {
            contextName: 'a',
            operator: 'NUM_LTE',
            value: '1',
        }),
    ).not.toThrow();
});

test('throwOnInvalidSchema', () => {
    expect(() =>
        throwOnInvalidSchema(constraintSchema.$id, {
            contextName: 'a',
            operator: 'invalid-operator',
            value: '1',
        }),
    ).toThrow(
        'Request validation failed: your request body or params contain invalid data. Refer to the `details` list for more information.',
    );
});
