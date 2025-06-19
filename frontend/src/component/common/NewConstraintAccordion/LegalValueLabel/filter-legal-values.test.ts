import { filterLegalValues } from './LegalValueLabel.js';

describe('filterLegalValues function tests', () => {
    const mockLegalValues = [
        { value: 'Apple', description: 'A fruit' },
        { value: 'Banana', description: 'Yellow fruit' },
        { value: 'Carrot', description: 'A vegetable' },
        { value: 'SE', description: 'Sweden' },
        { value: 'Eggplant', description: undefined },
    ];

    test('Basic functionality with value property', () => {
        const filter = 'apple';
        const expected = [{ value: 'Apple', description: 'A fruit' }];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });

    test('Filters based on description property', () => {
        const filter = 'vegetable';
        const expected = [{ value: 'Carrot', description: 'A vegetable' }];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });

    test('Case insensitivity', () => {
        const filter = 'BANANA';
        const expected = [{ value: 'Banana', description: 'Yellow fruit' }];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });

    test('No matches found', () => {
        const filter = 'Zucchini';
        expect(filterLegalValues(mockLegalValues, filter)).toEqual([]);
    });

    test('Empty filter string', () => {
        const filter = '';
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(
            mockLegalValues,
        );
    });

    test('Special characters in filter', () => {
        const filter = 'a fruit';
        const expected = [{ value: 'Apple', description: 'A fruit' }];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });

    test('Empty input array', () => {
        const filter = 'anything';
        expect(filterLegalValues([], filter)).toEqual([]);
    });

    test('Exact match', () => {
        const filter = 'Carrot';
        const expected = [{ value: 'Carrot', description: 'A vegetable' }];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });

    test('Partial match', () => {
        const filter = 'sw';
        const expected = [{ value: 'SE', description: 'Sweden' }];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });

    test('Combination of match and no match', () => {
        const filter = 'a';
        const expected = [
            { value: 'Apple', description: 'A fruit' },
            { value: 'Banana', description: 'Yellow fruit' },
            { value: 'Carrot', description: 'A vegetable' },
            { value: 'Eggplant', description: undefined },
        ];
        expect(filterLegalValues(mockLegalValues, filter)).toEqual(expected);
    });
});
