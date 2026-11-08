import { expect, test } from 'vitest';
import { constraintValidator } from './constraint-validator.js';
import {
    getDeletedLegalValues,
    getInvalidLegalValues,
} from './legal-value-functions.js';

test('should return deleted legal values', () => {
    const deletedLegalValues = getDeletedLegalValues(
        [{ value: 'A' }, { value: 'B' }],
        ['A', 'C'],
    );
    expect([...deletedLegalValues]).toStrictEqual(['C']);
});

test('should return invalid legal values', () => {
    const invalidLegalValues = getInvalidLegalValues(
        (value: string) => value === 'B',
        [{ value: 'A' }, { value: 'B' }],
    );
    expect([...invalidLegalValues]).toEqual(['A']);
});

test('should classify non-finite numeric legal values as invalid', () => {
    const validate = constraintValidator('NUM_EQ');
    const invalidLegalValues = getInvalidLegalValues(
        (value: string) => validate(value)[0],
        [
            { value: '1' },
            { value: 'Infinity' },
            { value: '-1e309' },
            { value: '2.5' },
        ],
    );
    expect([...invalidLegalValues]).toEqual(['Infinity', '-1e309']);
});
