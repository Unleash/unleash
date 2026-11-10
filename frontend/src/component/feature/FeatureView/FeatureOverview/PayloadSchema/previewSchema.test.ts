import { expect, test } from 'vitest';
import type { JsonSchemaProperty } from './payloadSchemaTypes.ts';
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
