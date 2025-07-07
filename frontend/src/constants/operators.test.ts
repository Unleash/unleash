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
} from './operators.js';

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

type OperatorCategory =
    | 'date'
    | 'in'
    | 'multi-value'
    | 'new'
    | 'number'
    | 'semver'
    | 'single-value'
    | 'string';

const expectOperatorTypes = (
    operators: Operator[],
    categories: OperatorCategory[],
) => {
    const successfulChecks = [
        operators.every(isDateOperator) && 'date',
        operators.every(isInOperator) && 'in',
        operators.every(isMultiValueOperator) && 'multi-value',
        operators.every(isNumOperator) && 'number',
        operators.every(isSemVerOperator) && 'semver',
        operators.every(isSingleValueOperator) && 'single-value',
        operators.every(isStringOperator) && 'string',
        operators.every(isNewOperator) && 'new',
    ].filter(Boolean);

    expect(categories.toSorted()).toStrictEqual(successfulChecks.toSorted());
};
