import { renderHook } from '@testing-library/react';
import {
    dateOperators,
    IN,
    multipleValueOperators,
    NOT_IN,
    numOperators,
    semVerOperators,
} from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';
import { useEditableConstraint } from './useEditableConstraint';
import { vi } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = (existingTokensCount: number) => {
    testServerRoute(server, '/api/admin/context', {
        what: 'mock me',
    });
};

test('calls onUpdate with new state', () => {
    const initial: IConstraint = {
        contextName: 'context-field',
        operator: NOT_IN,
        values: ['A', 'B'],
    };

    const onUpdate = vi.fn();

    const { result } = renderHook(() =>
        useEditableConstraint(initial, onUpdate),
    );
    result.current.updateConstraint({
        type: 'set operator',
        payload: IN,
    });

    expect(onUpdate).toHaveBeenCalledWith({
        contextName: 'context-field',
        operator: IN,
        values: [],
    });
});

describe('validators', () => {
    const checkValidator = (
        validator: (...values: string[]) => [boolean, string],
        expectations: [string | string[], boolean][],
    ) => {
        expect(
            expectations.every(([value, outcome]) =>
                Array.isArray(value)
                    ? validator(...value)[0] === outcome
                    : validator(value)[0] === outcome,
            ),
        ).toBe(true);
    };

    test.each(numOperators)(
        'picks the right validator for num operator: %s',
        (operator) => {
            const initial: IConstraint = {
                contextName: 'context-field',
                operator: operator,
                value: '',
            };

            const { result } = renderHook(() =>
                useEditableConstraint(initial, () => {}),
            );

            checkValidator(result.current.validator, [
                ['5', true],
                ['5.6', true],
                ['5,6', false],
                ['not a number', false],
                ['1.2.6', false],
                ['2025-05-13T07:39:23.053Z', false],
            ]);
        },
    );
    test.each(semVerOperators)(
        'picks the right validator for semVer operator: %s',
        (operator) => {
            const initial: IConstraint = {
                contextName: 'context-field',
                operator: operator,
                value: '',
            };

            const { result } = renderHook(() =>
                useEditableConstraint(initial, () => {}),
            );

            checkValidator(result.current.validator, [
                ['5', false],
                ['5.6', false],
                ['5,6', false],
                ['not a number', false],
                ['1.2.6', true],
                ['2025-05-13T07:39:23.053Z', false],
            ]);
        },
    );
    test.each(dateOperators)(
        'picks the right validator for date operator: %s',
        (operator) => {
            const initial: IConstraint = {
                contextName: 'context-field',
                operator: operator,
                value: '',
            };

            const { result } = renderHook(() =>
                useEditableConstraint(initial, () => {}),
            );

            checkValidator(result.current.validator, [
                ['5', false],
                ['5.6', false],
                ['5,6', false],
                ['not a number', false],
                ['1.2.6', false],
                ['2025-05-13T07:39:23.053Z', true],
            ]);
        },
    );
    test.each(multipleValueOperators)(
        'picks the right value for multi-value operator: %s',
        (operator) => {
            const initial: IConstraint = {
                contextName: 'context-field',
                operator: operator,
                values: [],
            };

            const { result } = renderHook(() =>
                useEditableConstraint(initial, () => {}),
            );

            checkValidator(result.current.validator, [
                ['5', true],
                [['hey'], true],
                // @ts-expect-error
                [[5, 6], false],
            ]);
        },
    );
});
describe('legal values', () => {
    test('provides them if present', () => {});
    test('does not add them if no legal values', () => {});
    test('identifies deleted legal values', () => {});
    test('identifies invalid legal values', () => {});
});
