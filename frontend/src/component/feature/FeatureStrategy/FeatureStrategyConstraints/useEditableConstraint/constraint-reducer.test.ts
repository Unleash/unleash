import {
    allOperators,
    IN,
    isDateOperator,
    isMultiValueOperator,
    isSingleValueOperator,
    NOT_IN,
    NUM_EQ,
} from 'constants/operators';
import type {
    EditableConstraint,
    EditableDateConstraint,
    EditableMultiValueConstraint,
    EditableSingleValueConstraint,
} from './editable-constraint-type';
import { DATE_AFTER, DATE_BEFORE } from '@server/util/constants';
import { constraintReducer } from './constraint-reducer';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';

const multiValueConstraint = (
    contextField: string,
): EditableMultiValueConstraint => ({
    contextName: contextField,
    operator: NOT_IN,
    values: new Set(['A', 'B']),
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

const getConstraintForOperator = (
    operator: string,
    contextField: string,
): EditableConstraint => {
    if (isDateOperator(operator)) {
        return { ...dateConstraint(contextField), operator };
    }
    if (isSingleValueOperator(operator)) {
        return { ...singleValueConstraint(contextField), operator };
    }
    if (isMultiValueOperator(operator)) {
        return { ...multiValueConstraint(contextField), operator };
    }
    return { ...multiValueConstraint(contextField), operator: IN };
};

describe('changing context field', () => {
    test.each([
        ['multi-value', multiValueConstraint],
        ['single-value', singleValueConstraint],
        ['date', dateConstraint],
    ])(
        'changing context field to the same field is a no-op for %s constraints',
        (_, constraint) => {
            const input = constraint('test-context-field');
            expect(
                constraintReducer(input, {
                    type: 'set context field',
                    payload: input.contextName,
                }),
            ).toStrictEqual(input);
        },
    );
    test('changing context field for a single-value constraint clears the `value` prop', () => {
        const input = singleValueConstraint('field-a');
        const result = constraintReducer(input, {
            type: 'set context field',
            payload: 'field-b',
        });
        expect(result).toStrictEqual({
            ...input,
            contextName: 'field-b',
            value: '',
        });
    });

    test('changing context field for a multi-value constraint clears the `values` prop', () => {
        const input = multiValueConstraint('field-a');
        const result = constraintReducer(input, {
            type: 'set context field',
            payload: 'field-b',
        });
        expect(result).toStrictEqual({
            ...input,
            contextName: 'field-b',
            values: new Set(),
        });
    });

    test.each([
        ['multi-value', multiValueConstraint],
        ['single-value', singleValueConstraint],
    ])(
        'changing context field to currentTime from a %s constraint sets the current time as the value',
        (_, constraint) => {
            const now = new Date();
            const input = constraint('field-a');
            // @ts-expect-error: we know we should get a value back here, and if not the test'll fail
            const { value, ...result } = constraintReducer(input, {
                type: 'set context field',
                payload: 'currentTime',
            });
            // @ts-expect-error extract any value fields
            const { values: _vs, value: _v, ...inputBody } = input;
            expect(result).toStrictEqual({
                ...inputBody,
                contextName: 'currentTime',
                operator: DATE_AFTER,
            });
            expect(new Date(value).getTime()).toBeGreaterThanOrEqual(
                now.getTime(),
            );
        },
    );
    test('changing context field from currentTime to something else sets a default operator', () => {
        const input = dateConstraint(CURRENT_TIME_CONTEXT_FIELD);
        const result = constraintReducer(input, {
            type: 'set context field',
            payload: 'somethingElse',
        });
        const { value: _, ...inputBody } = input;
        expect(result).toStrictEqual({
            ...inputBody,
            contextName: 'somethingElse',
            operator: IN,
            values: new Set(),
        });
    });
});
describe('changing operator', () => {
    test.each(allOperators)(
        'changing operator to the same operator (%s) is a no-op',
        (operator) => {
            const constraint = getConstraintForOperator(
                operator,
                'context-field',
            );
            expect(
                constraintReducer(constraint, {
                    type: 'set operator',
                    payload: operator,
                }),
            ).toStrictEqual(constraint);
        },
    );

    const nonDateOperators = allOperators.filter((op) => !isDateOperator(op));
    const allCombinations = nonDateOperators
        .flatMap((a) => nonDateOperators.map((b) => [a, b]))
        .filter(([a, b]) => a !== b);

    test.each(allCombinations)(
        "changing the operator to anything that isn't date based clears the value: %s -> %s",
        (operatorA, operatorB) => {
            const constraint = getConstraintForOperator(
                operatorA,
                'context-field',
            );
            // @ts-expect-error
            const { value, values, ...result } = constraintReducer(constraint, {
                type: 'set operator',
                payload: operatorB,
            });
            const {
                // @ts-expect-error
                value: _v,
                // @ts-expect-error
                values: _values,
                ...inputConstraint
            } = constraint;
            expect(result).toStrictEqual({
                ...inputConstraint,
                operator: operatorB,
            });

            if (isMultiValueOperator(operatorB)) {
                expect(values).toStrictEqual(new Set());
            } else if (isSingleValueOperator(operatorB)) {
                expect(value).toBe('');
            }
        },
    );

    const dateTransititons = [
        [DATE_BEFORE, DATE_AFTER],
        [DATE_AFTER, DATE_BEFORE],
    ] as const;
    test.each(dateTransititons)(
        'changing the operator from one date operator to another date operator leaves the value untouched: %s -> %s',
        (operatorA, operatorB) => {
            const input: EditableDateConstraint = {
                ...dateConstraint('currentTime'),
                operator: operatorA,
            };
            const output = constraintReducer(input, {
                type: 'set operator',
                payload: operatorB,
            });
            // @ts-expect-error
            expect(input.value).toBe(output.value);
        },
    );
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
