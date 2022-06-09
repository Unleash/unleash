import { validateSchema } from './validate';

test('validateSchema', () => {
    expect(() => validateSchema('unknownSchemaId' as any, {})).toThrow(
        'no schema with key or ref "unknownSchemaId"',
    );
});
