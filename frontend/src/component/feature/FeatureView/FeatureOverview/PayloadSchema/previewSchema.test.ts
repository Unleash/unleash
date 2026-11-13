import { expect, test } from 'vitest';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import { formValueWithExamplesAsDefaults } from './previewSchema';

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
