import { describe, expect, it } from 'vitest';
import {
    type KeyValuePair,
    kvpsToEditableForm,
    kvpsToStorageForm,
    validateKeys,
} from './KvpParameterUtils';
import type { AddonParameterSchema } from 'openapi';

const irrelevantFields = { displayName: '', required: false, sensitive: false };

const providerParams: AddonParameterSchema[] = [
    {
        name: 'stringParam',
        type: 'text',
        ...irrelevantFields,
    },
    {
        name: 'kvpParam',
        type: 'keyvaluepairs',
        ...irrelevantFields,
    },
];

describe('loading into the form', () => {
    it('turns key-value pair params into editable pairs', () => {
        const input = {
            stringParam: 'just a string',
            kvpParam: { x: 'one', y: 'two' },
        };
        const expected = {
            stringParam: 'just a string',
            kvpParam: [
                ['x', 'one'],
                ['y', 'two'],
            ],
        };

        expect(kvpsToEditableForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });

    it('leaves object values of non-kvp params as they are', () => {
        const input = { stringParam: { x: 'one' } };
        const expected = { stringParam: { x: 'one' } };
        expect(kvpsToEditableForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });

    it('leaves params as they are when the provider is unknown', () => {
        const input = { kvpParam: { x: 'one' } };
        const expected = { kvpParam: { x: 'one' } };
        expect(kvpsToEditableForm(undefined)(input)).toStrictEqual(expected);
    });
});

describe('saving from the form', () => {
    it('stores pairs as an object', () => {
        const input = {
            kvpParam: [
                ['x', 'one'],
                ['y', 'two'],
            ],
        };
        const expected = {
            kvpParam: { x: 'one', y: 'two' },
        };

        expect(kvpsToStorageForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });

    it('trims whitespace around keys', () => {
        const input = {
            kvpParam: [[' x  ', ' one ']],
        };
        const expected = {
            kvpParam: { x: ' one ' },
        };

        expect(kvpsToStorageForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });

    it('omits kvp params without pairs', () => {
        const input = {
            kvpParam: [],
        };
        const expected = {};

        expect(kvpsToStorageForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });

    it('leaves string params as they are', () => {
        const input = { stringParam: 'just a string' };
        const expected = { ...input };
        expect(kvpsToStorageForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });

    it('keeps kvp params that were never converted to pairs', () => {
        const input = { kvpParam: { x: 'one' } };
        const expected = { kvpParam: { x: 'one' } };
        expect(kvpsToStorageForm(providerParams)(input)).toStrictEqual(
            expected,
        );
    });
});

describe('validate keys', () => {
    it('flags empty, whitespace-only, and duplicate keys', () => {
        const keys: KeyValuePair[] = [
            ['okay!', ''],
            ['duplicate', ''],
            ['', ''],
            ['   ', ''],
            ['also fine', ''],
            ['duplicate', ''],
        ];

        const expectedErrors = [
            undefined,
            'DuplicateKey',
            'Empty',
            'WhitespaceOnly',
            undefined,
            'DuplicateKey',
        ];

        expect(validateKeys(keys)).toStrictEqual(expectedErrors);
    });

    it('treats keys that differ only in surrounding whitespace as duplicates', () => {
        const keys: KeyValuePair[] = [
            ['key', ''],
            ['  key   ', ''],
        ];

        expect(validateKeys(keys)).toStrictEqual([
            'DuplicateKey',
            'DuplicateKey',
        ]);
    });
});
