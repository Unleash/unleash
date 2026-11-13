import { expect, test } from 'vitest';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import { schemaFields } from './schemaFields.ts';

test('a schema without properties has no fields', () => {
    const schema: JsonSchemaProperty = { type: 'object' };

    expect(schemaFields(schema)).toEqual({
        fieldNames: [],
        hasAdditionalProperties: false,
    });
});

test('each top-level property is a field', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        properties: {
            name: { type: 'string' },
            age: { type: 'integer' },
        },
    };

    expect(schemaFields(schema)).toEqual({
        fieldNames: ['name', 'age'],
        hasAdditionalProperties: false,
    });
});

test('a nested object counts as its leaf fields, not as a field itself', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        properties: {
            name: { type: 'string' },
            address: {
                type: 'object',
                properties: {
                    city: { type: 'string' },
                    zip: { type: 'string' },
                },
            },
        },
    };

    expect(schemaFields(schema)).toEqual({
        fieldNames: ['name', 'city', 'zip'],
        hasAdditionalProperties: false,
    });
});

test('an empty nested object is not a field', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        properties: {
            name: { type: 'string' },
            address: { type: 'object' },
        },
    };

    expect(schemaFields(schema)).toEqual({
        fieldNames: ['name'],
        hasAdditionalProperties: false,
    });
});

test('a schema allowing additional properties is flagged as such', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        additionalProperties: true,
        properties: { name: { type: 'string' } },
    };

    expect(schemaFields(schema)).toEqual({
        fieldNames: ['name'],
        hasAdditionalProperties: true,
    });
});

test('additional properties allowed on a nested object are flagged too', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        properties: {
            address: {
                type: 'object',
                additionalProperties: true,
                properties: { city: { type: 'string' } },
            },
        },
    };

    expect(schemaFields(schema)).toEqual({
        fieldNames: ['city'],
        hasAdditionalProperties: true,
    });
});
