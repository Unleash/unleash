import { expect, test } from 'vitest';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import {
    defaultPayloadValue,
    formValueWithExamplesAsDefaults,
} from './schemaFormValues';

test('resolves each property from its own default, then the root default, then its own example, then the root example', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        default: { fromRootDefault: 'root default' },
        examples: [{ fromRootExample: 'root example' }],
        properties: {
            fromOwnDefault: {
                type: 'string',
                default: 'own default',
                examples: ['ignored, since its own default wins'],
            },
            fromRootDefault: { type: 'string' },
            fromOwnExample: { type: 'string', examples: ['own example'] },
            fromRootExample: { type: 'string' },
            unset: { type: 'string' },
        },
    };

    expect(formValueWithExamplesAsDefaults(schema)).toEqual({
        fromOwnDefault: 'own default',
        fromRootDefault: 'root default',
        fromOwnExample: 'own example',
        fromRootExample: 'root example',
        unset: undefined,
    });
});

test('recurses into nested object properties, applying the same precedence at each level', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        examples: [
            {
                address: {
                    zip: 'from root example',
                    city: 'from root example',
                },
            },
        ],
        properties: {
            address: {
                type: 'object',
                properties: {
                    zip: { type: 'string', default: 'own default' },
                    city: { type: 'string' },
                },
            },
        },
    };

    expect(formValueWithExamplesAsDefaults(schema)).toEqual({
        address: {
            zip: 'own default',
            city: 'from root example',
        },
    });
});

test('fills a nested object from both the root default and the root example when they cover different fields', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        default: { address: { city: 'from root default' } },
        examples: [{ address: { zip: 'from root example' } }],
        properties: {
            address: {
                type: 'object',
                properties: {
                    city: { type: 'string' },
                    zip: { type: 'string' },
                },
            },
        },
    };

    expect(formValueWithExamplesAsDefaults(schema)).toEqual({
        address: {
            city: 'from root default',
            zip: 'from root example',
        },
    });
});

test('ignores a non-object default or example at the root', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        default: 'not an object',
        examples: ['also not an object'],
        properties: { name: { type: 'string' } },
    };

    expect(formValueWithExamplesAsDefaults(schema)).toEqual({
        name: undefined,
    });
});

test('defaultPayloadValue fills every required gap with a type-appropriate empty value, preferring a declared default over an example', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        required: [
            'name',
            'fromExampleOnly',
            'age',
            'active',
            'tags',
            'labels',
            'role',
            'address',
        ],
        properties: {
            name: { type: 'string', default: 'Jane' },
            fromExampleOnly: { type: 'string', examples: ['an example'] },
            age: { type: 'number' },
            active: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            labels: {
                type: 'object',
                additionalProperties: { type: 'string' },
            },
            role: { type: 'string', enum: ['admin', 'viewer'] },
            address: {
                type: 'object',
                required: ['city'],
                properties: { city: { type: 'string' } },
            },
        },
    };

    expect(defaultPayloadValue(schema)).toEqual({
        name: 'Jane',
        fromExampleOnly: '',
        age: 0,
        active: false,
        tags: [],
        labels: {},
        role: 'admin',
        address: { city: '' },
    });
});

test('defaultPayloadValue omits an optional property with no declared default instead of inventing a skeleton value', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', default: 'Jane' },
            notes: { type: 'string' },
        },
    };

    expect(defaultPayloadValue(schema)).toEqual({ name: 'Jane' });
});

test('defaultPayloadValue omits an optional object even when one of its own properties is required', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', default: 'Jane' },
            address: {
                type: 'object',
                required: ['city'],
                properties: { city: { type: 'string' } },
            },
        },
    };

    expect(defaultPayloadValue(schema)).toEqual({ name: 'Jane' });
});
