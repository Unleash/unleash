import { renderHook, waitFor } from '@testing-library/react';
import {
    dateOperators,
    IN,
    multipleValueOperators,
    NOT_IN,
    numOperators,
    semVerOperators,
} from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';
import { useEditableConstraint } from './useEditableConstraint.js';
import { vi } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { ContextFieldSchema } from 'openapi';
import { NUM_EQ } from '@server/util/constants';

const server = testServerSetup();

const setupApi = (contextField?: ContextFieldSchema) => {
    testServerRoute(server, '/api/admin/context', [contextField]);
};

test('calls onUpdate with new state', async () => {
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

    // gets called by useEffect, so we need to wait for the next render.
    await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                contextName: 'context-field',
                operator: IN,
                values: [],
            }),
        );
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

    test.each(
        numOperators,
    )('picks the right validator for num operator: %s', (operator) => {
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
    });
    test.each(
        semVerOperators,
    )('picks the right validator for semVer operator: %s', (operator) => {
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
    });
    test.each(
        dateOperators,
    )('picks the right validator for date operator: %s', (operator) => {
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
    });
    test.each(
        multipleValueOperators,
    )('picks the right value for multi-value operator: %s', (operator) => {
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
    });

    test.each(
        multipleValueOperators,
    )('multi-value operator %s should reject fully duplicate inputs and accept new values', (operator) => {
        const initial: IConstraint = {
            contextName: 'context-field',
            operator: operator,
            values: ['a', 'b'],
        };

        const { result } = renderHook(() =>
            useEditableConstraint(initial, () => {}),
        );

        checkValidator(result.current.validator, [
            ['a', false],
            [['a', 'c'], true],
            [['a', 'b'], false],
        ]);
    });
});

describe('legal values', () => {
    const definition = {
        name: 'context-field',
        legalValues: [{ value: 'A' }, { value: '6' }],
    };
    setupApi(definition);

    test('provides them if present', async () => {
        const initial: IConstraint = {
            contextName: definition.name,
            operator: IN,
            values: [],
        };

        const { result } = renderHook(() =>
            useEditableConstraint(initial, () => {}),
        );
        await waitFor(() => {
            expect(result.current.legalValueData?.legalValues).toStrictEqual(
                definition.legalValues,
            );
        });
    });

    test('updates context definition when changing context field', async () => {
        const initial: IConstraint = {
            contextName: definition.name,
            operator: IN,
            values: [],
        };

        const { result } = renderHook(() =>
            useEditableConstraint(initial, () => {}),
        );
        await waitFor(() => {
            expect(result.current.legalValueData?.legalValues).toStrictEqual(
                definition.legalValues,
            );
        });

        result.current.updateConstraint({
            type: 'set context field',
            payload: 'field-without-legal-values',
        });

        await waitFor(() => {
            expect(result.current.legalValueData).toBeUndefined();
        });
    });
    test('does not add them if no legal values', () => {
        const initial: IConstraint = {
            contextName: 'field-with-no-legal-values',
            operator: IN,
            values: [],
        };

        const { result } = renderHook(() =>
            useEditableConstraint(initial, () => {}),
        );

        expect(result.current.legalValueData).toBeUndefined();
    });
    test('identifies deleted legal values', async () => {
        const initial: IConstraint = {
            contextName: definition.name,
            operator: IN,
            values: ['A', 'B'],
        };

        const { result } = renderHook(() =>
            useEditableConstraint(initial, () => {}),
        );
        await waitFor(() => {
            expect(
                result.current.legalValueData?.deletedLegalValues,
            ).toStrictEqual(new Set(['B']));
        });
    });
    test('identifies invalid legal values', async () => {
        const initial: IConstraint = {
            contextName: definition.name,
            operator: NUM_EQ,
            values: [],
        };

        const { result } = renderHook(() =>
            useEditableConstraint(initial, () => {}),
        );
        await waitFor(() => {
            expect(
                result.current.legalValueData?.invalidLegalValues,
            ).toStrictEqual(new Set(['A']));
        });
    });
});
