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
} from './editable-constraint-type.js';
import { DATE_AFTER, DATE_BEFORE } from '@server/util/constants';
import { constraintReducer } from './constraint-reducer.js';
import { CURRENT_TIME_CONTEXT_FIELD } from 'utils/operatorsForContext';

const extraConstraintFields: Partial<EditableConstraint> = {
    inverted: true,
    caseInsensitive: true,
};

const multiValueConstraint: EditableMultiValueConstraint = {
    ...extraConstraintFields,
    contextName: 'multi-value-context-field',
    operator: NOT_IN,
    values: new Set(['A', 'B']),
};

const singleValueConstraint: EditableSingleValueConstraint = {
    ...extraConstraintFields,
    contextName: 'single-value-context-field',
    operator: NUM_EQ,
    value: '5',
};

const dateConstraint: EditableDateConstraint = {
    ...extraConstraintFields,
    contextName: CURRENT_TIME_CONTEXT_FIELD,
    operator: DATE_AFTER,
    value: '2024-05-05T00:00:00Z',
};

const getConstraintForOperator = (operator: string): EditableConstraint => {
    if (isDateOperator(operator)) {
        return { ...dateConstraint, operator };
    }
    if (isSingleValueOperator(operator)) {
        return { ...singleValueConstraint, operator };
    }
    if (isMultiValueOperator(operator)) {
        return { ...multiValueConstraint, operator };
    }
    return { ...multiValueConstraint, operator: IN };
};

// helper type to allow deconstruction to { value, values, ...rest }
type Extractable = EditableConstraint & {
    value?: string;
    values?: Set<string>;
};

describe('changing context field', () => {
    test.each([
        ['multi-value', multiValueConstraint],
        ['single-value', singleValueConstraint],
        ['date', dateConstraint],
    ])('changing context field to the same field is a no-op for %s constraints', (_, constraint) => {
        const input = constraint;
        expect(
            constraintReducer(input, {
                type: 'set context field',
                payload: input.contextName,
            }),
        ).toStrictEqual(input);
    });
    test('changing context field for a single-value constraint clears the `value` prop', () => {
        const input = { ...singleValueConstraint, contextName: 'field-a' };
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
        const input = { ...multiValueConstraint, contextName: 'field-a' };
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
    ])('changing context field to currentTime from a %s constraint sets the current time as the value', (_, constraint) => {
        const now = new Date();
        const input = { ...constraint, contextName: 'field-a' };
        const { value, ...result } = constraintReducer(input, {
            type: 'set context field',
            payload: 'currentTime',
        }) as Extractable;
        const { values: _vs, value: _v, ...inputBody } = input as Extractable;
        expect(result).toStrictEqual({
            ...inputBody,
            contextName: 'currentTime',
            operator: DATE_AFTER,
        });
        expect(new Date(value as string).getTime()).toBeGreaterThanOrEqual(
            now.getTime(),
        );
    });
    test('changing context field from currentTime to something else sets a default operator', () => {
        const input = dateConstraint;
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
    test.each(
        allOperators,
    )('changing operator to the same operator (%s) is a no-op', (operator) => {
        const constraint = getConstraintForOperator(operator);
        expect(
            constraintReducer(constraint, {
                type: 'set operator',
                payload: operator,
            }),
        ).toStrictEqual(constraint);
    });

    const nonDateOperators = allOperators.filter((op) => !isDateOperator(op));
    const allCombinations = nonDateOperators
        .flatMap((a) => nonDateOperators.map((b) => [a, b]))
        .filter(([a, b]) => a !== b);

    test.each(
        allCombinations,
    )("changing the operator to anything that isn't date based clears the value: %s -> %s", (operatorA, operatorB) => {
        const constraint = getConstraintForOperator(operatorA);
        const { value, values, ...result } = constraintReducer(constraint, {
            type: 'set operator',
            payload: operatorB,
        }) as Extractable;
        const {
            value: _v,
            values: _values,
            ...inputConstraint
        } = constraint as Extractable;
        expect(result).toStrictEqual({
            ...inputConstraint,
            operator: operatorB,
        });

        if (isMultiValueOperator(operatorB)) {
            expect(values).toStrictEqual(new Set());
        } else if (isSingleValueOperator(operatorB)) {
            expect(value).toBe('');
        }
    });

    const dateTransititons = [
        [DATE_BEFORE, DATE_AFTER],
        [DATE_AFTER, DATE_BEFORE],
    ] as const;
    test.each(
        dateTransititons,
    )('changing the operator from one date operator to another date operator leaves the value untouched: %s -> %s', (operatorA, operatorB) => {
        const input: EditableDateConstraint = {
            ...dateConstraint,
            operator: operatorA,
        };
        const output = constraintReducer(input, {
            type: 'set operator',
            payload: operatorB,
        });
        expect(input.value).toBe(
            (output as EditableSingleValueConstraint).value,
        );
    });
});
describe('adding values', () => {
    describe('single-value constraints', () => {
        test('adding a value replaces the existing value', () => {
            const input = singleValueConstraint;
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: 'new-value',
            });
            expect(output).toStrictEqual({
                ...input,
                value: 'new-value',
            });
        });
        test('adding a list replaces the existing value with the first value of the list', () => {
            const input = singleValueConstraint;
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: ['list-value'],
            });
            expect(output).toStrictEqual({
                ...input,
                value: 'list-value',
            });
        });
        test('adding an empty list effectively clears the value', () => {
            const input = singleValueConstraint;
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: [],
            });
            expect(output).toStrictEqual({
                ...input,
                value: '',
            });
        });

        test('trying to add a deleted legal value results in no change', () => {
            const input = {
                ...singleValueConstraint,
                deletedLegalValues: new Set(['deleted']),
            };
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: 'deleted',
            });
            expect(output).toStrictEqual(input);
        });
        test('if both the new value and the old value are deleted legal values, it clears the field', () => {
            const input = {
                ...singleValueConstraint,
                deletedLegalValues: new Set([
                    'deleted',
                    singleValueConstraint.value,
                ]),
            };

            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: 'deleted',
            });
            expect(output).toStrictEqual({
                ...input,
                value: '',
            });
        });
    });
    describe('multi-value constraints', () => {
        test('adding a single value to a multi-value constraint adds it to the set', () => {
            const input = multiValueConstraint;
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: 'new-value',
            });
            expect(output).toStrictEqual({
                ...input,
                values: new Set([...input.values, 'new-value']),
            });
        });
        test('adding a list to a multi-value constraint adds all new elements to the set', () => {
            const input = multiValueConstraint;
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: ['X', 'Y'],
            });
            expect(output).toStrictEqual({
                ...input,
                values: new Set([...input.values, 'X', 'Y']),
            });
        });
        test('adding an empty list to a multi-value constraint has no effect', () => {
            const input = multiValueConstraint;
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: [],
            });
            expect(output).toStrictEqual(input);
        });

        test('deleted legal values are removed from the set before saving new values', () => {
            const input = {
                ...multiValueConstraint,
                values: new Set(['deleted-old', 'A']),
                deletedLegalValues: new Set(['deleted-old', 'deleted-new']),
            };
            const output = constraintReducer(input, {
                type: 'add value(s)',
                payload: ['deleted-new', 'B'],
            });
            expect(output).toStrictEqual({
                ...input,
                values: new Set(['A', 'B']),
            });
        });
    });
});

describe('toggling values', () => {
    describe('single-value constraints', () => {
        test('if the toggle value is the same as the existing value: clears the value', () => {
            const input = singleValueConstraint;
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: input.value,
            });
            expect(output).toStrictEqual({
                ...input,
                value: '',
            });
        });
        test('if the toggle value is different from the existing value: replaces it', () => {
            const input = singleValueConstraint;
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: 'updated value',
            });
            expect(output).toStrictEqual({
                ...input,
                value: 'updated value',
            });
        });

        test('trying to add a deleted legal value results in no change', () => {
            const input = {
                ...singleValueConstraint,
                deletedLegalValues: new Set(['deleted']),
            };
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: 'deleted',
            });
            expect(output).toStrictEqual(input);
        });

        test('if both the new value and the old value are deleted legal values, it clears the field', () => {
            const input = {
                ...singleValueConstraint,
                deletedLegalValues: new Set([
                    'deleted',
                    singleValueConstraint.value,
                ]),
            };
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: 'deleted',
            });
            expect(output).toStrictEqual({
                ...input,
                value: '',
            });
        });
    });
    describe('multi-value constraints', () => {
        test('if not present, it will be added', () => {
            const input = multiValueConstraint;
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: 'new-value',
            });
            expect(output).toStrictEqual({
                ...input,
                values: new Set([...input.values, 'new-value']),
            });
        });
        test('if it is present, it will be removed', () => {
            const input = multiValueConstraint;
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: 'B',
            });
            expect(output).toStrictEqual({
                ...input,
                values: new Set(['A']),
            });
        });

        test('deleted legal values are removed from the set before saving new values', () => {
            const input = {
                ...multiValueConstraint,
                values: new Set(['deleted-old', 'A']),
                deletedLegalValues: new Set(['deleted-old', 'deleted-new']),
            };
            const output = constraintReducer(input, {
                type: 'toggle value',
                payload: 'deleted-new',
            });
            expect(output).toStrictEqual({
                ...input,
                values: new Set(['A']),
            });
        });
    });
});

describe('removing / clearing values', () => {
    describe('single-value constraints', () => {
        test('removing a value removes the existing value if it matches', () => {
            const input = {
                ...singleValueConstraint,
                contextName: 'context-field',
            };
            const noChange = constraintReducer(input, {
                type: 'remove value',
                payload: '55422b90-9bc4-4847-8a61-17fc928069ff',
            });
            expect(noChange).toStrictEqual(input);

            const removed = constraintReducer(input, {
                type: 'remove value',
                payload: input.value,
            });

            expect(removed).toStrictEqual({ ...input, value: '' });
        });
        test('clearing a value removes the existing value', () => {
            const input = {
                ...singleValueConstraint,
                contextName: 'context-field',
            };
            const cleared = constraintReducer(input, {
                type: 'clear values',
            });

            expect(cleared).toStrictEqual({ ...input, value: '' });
        });
    });
    describe('multi-value constraints', () => {
        test('removing a value removes it from the set if it exists', () => {
            const values = ['A', 'B', 'C'];
            const input = {
                ...multiValueConstraint,
                values: new Set(values),
            };
            const noChange = constraintReducer(input, {
                type: 'remove value',
                payload: '55422b90-9bc4-4847-8a61-17fc928069ff',
            });
            expect(noChange).toStrictEqual(input);

            const removed = constraintReducer(input, {
                type: 'remove value',
                payload: 'B',
            });

            expect(removed).toStrictEqual({
                ...input,
                values: new Set(['A', 'C']),
            });
        });
        test('clearing values removes all values from the set', () => {
            const input = multiValueConstraint;
            const cleared = constraintReducer(input, {
                type: 'clear values',
            });

            expect(cleared).toStrictEqual({
                ...input,
                values: new Set(),
            });
        });
    });
});
describe('toggle options', () => {
    const stateTransitions = [
        [undefined, true],
        [true, false],
        [false, true],
    ];
    test.each(
        stateTransitions,
    )('toggle case sensitivity: %s -> %s', (from, to) => {
        const input = {
            ...multiValueConstraint,
            caseInsensitive: from,
        };
        expect(
            constraintReducer(input, {
                type: 'toggle case sensitivity',
            }),
        ).toStrictEqual({
            ...input,
            caseInsensitive: to,
        });
    });
    test.each(stateTransitions)('match inversion: %s -> %s', (from, to) => {
        const input = {
            ...multiValueConstraint,
            inverted: from,
        };
        expect(
            constraintReducer(input, {
                type: 'toggle inverted operator',
            }),
        ).toStrictEqual({
            ...input,
            inverted: to,
        });
    });
});
