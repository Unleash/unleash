import { describe, expect, test } from 'vitest';
import {
    NAME_MAX_LENGTH,
    validateInstanceName,
} from './validateInstanceName.js';

describe('validateInstanceName', () => {
    test('accepts empty and whitespace-only names without flagging an error', () => {
        expect(validateInstanceName('')).toBeUndefined();
        expect(validateInstanceName('   ')).toBeUndefined();
    });

    test('accepts letters, numbers, spaces, dots, slashes, parentheses, underscores and dashes (including unicode)', () => {
        expect(validateInstanceName('Acme 42')).toBeUndefined();
        expect(validateInstanceName('Acme (Prod)')).toBeUndefined();
        expect(validateInstanceName('Ação Ltda. / Foo Bar')).toBeUndefined();
        expect(validateInstanceName('Acme_Prod-01')).toBeUndefined();
    });

    test('accepts names at the max length', () => {
        expect(
            validateInstanceName('a'.repeat(NAME_MAX_LENGTH)),
        ).toBeUndefined();
    });

    test('rejects names longer than the max length', () => {
        expect(validateInstanceName('a'.repeat(NAME_MAX_LENGTH + 1))).toMatch(
            /characters or fewer/,
        );
    });

    test('rejects disallowed characters', () => {
        expect(validateInstanceName('Acme <script>')).toMatch(
            /can only contain/,
        );
        expect(validateInstanceName('Acme: Prod')).toMatch(/can only contain/);
        expect(validateInstanceName('Acme, Inc')).toMatch(/can only contain/);
    });
});
