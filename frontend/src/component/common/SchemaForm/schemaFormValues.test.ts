import { expect, test } from 'vitest';
import type { JsonSchemaProperty } from 'interfaces/jsonSchema';
import {
    defaultPayloadValue,
    formValueWithExamplesAsDefaults,
    toDateTimeInputValue,
    valueFromInput,
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

test('defaultPayloadValue fills a required nullable property with null', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        required: ['until'],
        properties: {
            until: { type: ['string', 'null'], format: 'date-time' },
        },
    };

    expect(defaultPayloadValue(schema)).toEqual({ until: null });
});

test('defaultPayloadValue leaves a required formatted string unset, since no empty string matches a format', () => {
    const schema: JsonSchemaProperty = {
        type: 'object',
        required: ['contact'],
        properties: { contact: { type: 'string', format: 'email' } },
    };

    expect(defaultPayloadValue(schema)).toEqual({});
});

test('a root array starts from its default, then its first example, then no items', () => {
    const items = { type: 'string' };

    expect(
        formValueWithExamplesAsDefaults({
            type: 'array',
            items,
            default: ['default'],
            examples: [['example']],
        }),
    ).toEqual(['default']);
    expect(
        formValueWithExamplesAsDefaults({
            type: 'array',
            items,
            examples: [['example']],
        }),
    ).toEqual(['example']);
    expect(formValueWithExamplesAsDefaults({ type: 'array', items })).toEqual(
        [],
    );
});

test('defaultPayloadValue starts a root array from its default, ignoring examples', () => {
    const items = { type: 'string' };

    expect(
        defaultPayloadValue({
            type: 'array',
            items,
            default: ['default'],
        }),
    ).toEqual(['default']);
    expect(
        defaultPayloadValue({ type: 'array', items, examples: [['example']] }),
    ).toEqual([]);
});

test('a cleared field stores an empty string where its schema accepts one', () => {
    expect(valueFromInput({ type: 'string' }, '')).toBe('');
    expect(valueFromInput({ type: 'string', enum: ['', 's'] }, '')).toBe('');
});

test('a cleared field stores null where its schema allows null', () => {
    expect(
        valueFromInput({ type: ['string', 'null'], format: 'date-time' }, ''),
    ).toBeNull();
    expect(
        valueFromInput(
            { type: ['string', 'null'], enum: ['eu', 'us', null] },
            '',
        ),
    ).toBeNull();
});

test('a cleared field that accepts neither an empty string nor null is left out', () => {
    expect(valueFromInput({ type: 'string', format: 'email' }, '')).toBe(
        undefined,
    );
    expect(valueFromInput({ type: 'integer' }, '')).toBe(undefined);
    expect(valueFromInput({ type: 'string', enum: ['eu', 'us'] }, '')).toBe(
        undefined,
    );
});

test('numeric input is stored as a number', () => {
    expect(valueFromInput({ type: 'integer' }, '42')).toBe(42);
    expect(valueFromInput({ type: 'number' }, '0.5')).toBe(0.5);
});

test('a picked enum option keeps the type it is declared with', () => {
    expect(valueFromInput({ type: 'integer', enum: [1, 2] }, '2')).toBe(2);
});

test('date-time input is stored as an ISO timestamp', () => {
    expect(
        valueFromInput(
            { type: 'string', format: 'date-time' },
            '2026-10-09T04:00',
        ),
    ).toBe('2026-10-09T04:00:00.000Z');
});

test('a stored timestamp is shown in the date-time input format', () => {
    expect(toDateTimeInputValue('2026-10-09T02:00:00.000Z')).toBe(
        '2026-10-09T02:00',
    );
});

test('a missing or unparseable timestamp shows an empty date-time input', () => {
    expect(toDateTimeInputValue(undefined)).toBe('');
    expect(toDateTimeInputValue(null)).toBe('');
    expect(toDateTimeInputValue('not a date')).toBe('');
});
