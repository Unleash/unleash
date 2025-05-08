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
    newOperators,
    numOperators,
    semVerOperators,
    singleValueOperators,
    stringOperators,
    type Operator,
} from './operators';

describe('operators are correctly identified', () => {
    test('date operators', () => {
        expectOperatorTypes(dateOperators, ['date', 'single-value', 'new']);
    });
    test('in operators', () => {
        expectOperatorTypes(inOperators, ['in', 'multi-value']);
    });
    test('multi-value operators', () => {
        expectOperatorTypes(multipleValueOperators, ['multi-value']);
    });
    test('new operators', () => {
        expectOperatorTypes(newOperators, ['new']);
    });
    test('number operators', () => {
        expectOperatorTypes(numOperators, ['single-value', 'number', 'new']);
    });
    test('semver operators', () => {
        expectOperatorTypes(semVerOperators, ['single-value', 'semver', 'new']);
    });
    test('single-value operators', () => {
        expectOperatorTypes(singleValueOperators, ['single-value', 'new']);
    });
    test('string operators', () => {
        expectOperatorTypes(stringOperators, ['multi-value', 'string', 'new']);
    });
});

const expectOperatorTypes = (
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
    expect(operators.every(isDateOperator)).toBe(types.includes('date'));
    expect(operators.every(isInOperator)).toBe(types.includes('in'));
    expect(operators.every(isMultiValueOperator)).toBe(
        types.includes('multi-value'),
    );
    expect(operators.every(isNumOperator)).toBe(types.includes('number'));
    expect(operators.every(isSemVerOperator)).toBe(types.includes('semver'));
    expect(operators.every(isSingleValueOperator)).toBe(
        types.includes('single-value'),
    );
    expect(operators.every(isStringOperator)).toBe(types.includes('string'));
    expect(operators.every(isNewOperator)).toBe(types.includes('new'));
};
