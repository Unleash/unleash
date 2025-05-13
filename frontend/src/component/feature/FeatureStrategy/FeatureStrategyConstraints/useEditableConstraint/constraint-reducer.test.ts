import { NOT_IN, NUM_EQ } from 'constants/operators';
import type {
    EditableDateConstraint,
    EditableMultiValueConstraint,
    EditableSingleValueConstraint,
} from './editable-constraint-type';
import { DATE_AFTER } from '@server/util/constants';
import { constraintReducer } from './constraint-reducer';

const multiValueConstraint = (
    contextField: string,
): EditableMultiValueConstraint => ({
    contextName: contextField,
    operator: NOT_IN,
    values: new Set(['2023-01-01T00:00:00Z', '2023-01-02T00:00:00Z']),
});

const singleValueConstraint = (
    contextField: string,
): EditableSingleValueConstraint => ({
    contextName: contextField,
    operator: NUM_EQ,
    value: '5',
});

const dateConstraint = (contextField: string): EditableDateConstraint => ({
    contextName: contextField,
    operator: DATE_AFTER,
    value: '2024-05-05T00:00:00Z',
});

describe('changing context field', () => {
    test.each([multiValueConstraint, singleValueConstraint, dateConstraint])(
        'changing context field to the same field is a no-op',
        (constraint) => {
            const input = constraint('test-context-field');
            expect(
                constraintReducer(input, {
                    type: 'set context field',
                    payload: input.contextName,
                }),
            ).toStrictEqual(input);
        },
    );
    test('changing context field to anything except currentTime clears value/values', () => {});
});
describe('changing operator', () => {
    test('changing operator to the same operator field is a no-op', () => {});
    test("changing the operator to anything that isn't date based clears the value", () => {});
    test('changing the operator to a non-date operator to a date operator sets the value to the current time', () => {});
    test('changing the operator from one date operator to another date operator leaves the value untouched', () => {});
});
describe('adding values', () => {
    describe('single-value constraints', () => {
        test('adding a value replaces the existing value', () => {});
    });
    describe('multi-value constraints', () => {
        test('adding a value to a multi-value constraint adds it to the set', () => {});
        test('adding a value to a multi-value constraint adds it to the list', () => {});
    });
});
describe('removing / clearing values', () => {
    describe('single-value constraints', () => {
        test('removing a value removes the existing value if it matches', () => {});
        test('clearing a value removes the existing value', () => {});
    });
    describe('multi-value constraints', () => {
        test('removing a value removes it from the set', () => {});
        test('clearing values removes all values from the set', () => {});
    });
});
describe('toggle options', () => {
    test('case sensitivity', () => {});
});

describe('match inversion / inclusive/exclusive operator (`constraint.inverted`)', () => {
    test('match inversion', () => {});
    test('inverting the operator does not affect selected values', () => {});
});
