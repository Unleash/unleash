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
