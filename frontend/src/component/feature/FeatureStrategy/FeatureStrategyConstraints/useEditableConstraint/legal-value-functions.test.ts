import {
    getDeletedLegalValues,
    getInvalidLegalValues,
} from './legal-value-functions';

test('should return deleted legal values', () => {
    const deletedLegalValues = getDeletedLegalValues(
        [{ value: 'A' }, { value: 'B' }],
        ['A', 'C'],
    );
    expect([...deletedLegalValues]).toStrictEqual(['C']);
});

test('should return invalid legal values', () => {
    const invalidLegalValues = getInvalidLegalValues(
        [{ value: 'A' }, { value: 'B' }],
        (value: string) => value === 'B',
    );
    expect([...invalidLegalValues]).toEqual(['A']);
});
