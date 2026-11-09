import { BadDataError } from '../../error/index.js';
import { validatePayloadSchema } from './payload-schema-validator.js';

test('rejects a schema with a misspelled keyword', () => {
    const schema = { tpye: 'string' };

    expect(() => validatePayloadSchema(schema)).toThrow(BadDataError);
});

test('rejects a schema written for an older draft', () => {
    const schema = { $schema: 'http://json-schema.org/draft-07/schema#' };

    expect(() => validatePayloadSchema(schema)).toThrow(
        'Request validation failed: your request body or params contain invalid data: Invalid payload schema: only JSON Schema draft 2020-12 is supported (https://json-schema.org/draft/2020-12/schema).',
    );
});

test('accepts a schema that uses a standard format', () => {
    const schema = { type: 'string', format: 'date-time' };

    expect(() => validatePayloadSchema(schema)).not.toThrow();
});

test('accepts a value that may have more than one type', () => {
    const schema = { type: ['string', 'number'] };

    expect(() => validatePayloadSchema(schema)).not.toThrow();
});

test('accepts a schema that requires at least one of two properties', () => {
    const schema = {
        type: 'object',
        properties: { email: { type: 'string' }, phone: { type: 'string' } },
        anyOf: [{ required: ['email'] }, { required: ['phone'] }],
    };

    expect(() => validatePayloadSchema(schema)).not.toThrow();
});

test('accepts a tuple that does not fix its length', () => {
    const schema = {
        type: 'array',
        prefixItems: [{ type: 'string' }, { type: 'number' }],
    };

    expect(() => validatePayloadSchema(schema)).not.toThrow();
});

test('accepts a schema again when it carries an $id', () => {
    validatePayloadSchema({ $id: 'https://example.com/payload' });

    expect(() =>
        validatePayloadSchema({ $id: 'https://example.com/payload' }),
    ).not.toThrow();
});
