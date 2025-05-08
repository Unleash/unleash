import {
    dateOperators,
    inOperators,
    isDateOperator,
    isInOperator,
    isMultiValueOperator,
    isNewOperator,
    isNumOperator,
    isSemVerOperator,
    isSingleValueOperator,
    isStringOperator,
    multipleValueOperators,
    type Operator,
} from './operators';

describe('operators are correctly identified', () => {
    const allOperatorsAre = (
        operators: Operator[],
        types: Array<
            | 'date'
            | 'in'
            | 'multi-value'
            | 'new'
            | 'number'
            | 'semver'
            | 'single-value'
            | 'string'
        >,
    ) => {
        expect(operators.every(isDateOperator)).toBe('date' in types);
        expect(operators.every(isInOperator)).toBe('in' in types);
        expect(operators.every(isMultiValueOperator)).toBe(
            'multi-value' in types,
        );
        expect(operators.every(isNumOperator)).toBe('number' in types);
        expect(operators.every(isSemVerOperator)).toBe('semver' in types);
        expect(operators.every(isSingleValueOperator)).toBe(
            'single-value' in types,
        );
        expect(operators.every(isStringOperator)).toBe('string' in types);
        expect(operators.every(isNewOperator)).toBe('new' in types);
    };
    test('date operators', () => {
        allOperatorsAre(dateOperators, ['date', 'single-value']);
        expect(dateOperators.every(isDateOperator)).toBe(true);
        expect(dateOperators.every(isInOperator)).toBe(false);
        expect(dateOperators.every(isMultiValueOperator)).toBe(false);
        expect(dateOperators.every(isNumOperator)).toBe(false);
        expect(dateOperators.every(isSemVerOperator)).toBe(false);
        expect(dateOperators.every(isSingleValueOperator)).toBe(true);
        expect(dateOperators.every(isStringOperator)).toBe(false);
    });
    test('in operators', () => {
        expect(inOperators.every(isDateOperator)).toBe(false);
        expect(inOperators.every(isInOperator)).toBe(true);
        expect(inOperators.every(isMultiValueOperator)).toBe(true);
        expect(inOperators.every(isNumOperator)).toBe(false);
        expect(inOperators.every(isSemVerOperator)).toBe(false);
        expect(inOperators.every(isSingleValueOperator)).toBe(false);
        expect(inOperators.every(isStringOperator)).toBe(false);
    });
    test('multi-value operators', () => {
        expect(multipleValueOperators.every(isDateOperator)).toBe(false);
        expect(multipleValueOperators.every(isInOperator)).toBe(false);
        expect(multipleValueOperators.every(isMultiValueOperator)).toBe(true);
        expect(multipleValueOperators.every(isNumOperator)).toBe(false);
        expect(multipleValueOperators.every(isSemVerOperator)).toBe(false);
        expect(multipleValueOperators.every(isSingleValueOperator)).toBe(false);
        expect(multipleValueOperators.every(isStringOperator)).toBe(false);
    });
    test('new operators', () => {});
    test('number operators', () => {});
    test('semver operators', () => {});
    test('single-value operators', () => {});
    test('string operators', () => {});
});
