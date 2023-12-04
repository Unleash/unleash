import { render } from 'utils/testRenderer';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { usePersistentTableState } from './usePersistentTableState';
import { Route, Routes } from 'react-router-dom';
import { createLocalStorage } from '../utils/createLocalStorage';
import { NumberParam, StringParam } from 'use-query-params';

type TestComponentProps = {
    keyName: string;
    queryParamsDefinition: Record<string, any>;
};

function TestComponent({ keyName, queryParamsDefinition }: TestComponentProps) {
    const [tableState, setTableState] = usePersistentTableState(
        keyName,
        queryParamsDefinition,
    );

    return (
        <Routes>
            <Route
                path={'/my-url'}
                element={
                    <div>
                        <span data-testid='state-value'>
                            {tableState.query}
                        </span>
                        <button
                            type='button'
                            onClick={() => setTableState({ query: 'after' })}
                        >
                            Update State
                        </button>
                        <button
                            type='button'
                            onClick={() => setTableState({ offset: 20 })}
                        >
                            Update Offset
                        </button>
                    </div>
                }
            />
        </Routes>
    );
}

describe('usePersistentTableState', () => {
    it('initializes correctly from URL', async () => {
        createLocalStorage('testKey', {});

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{ query: StringParam }}
            />,
            { route: '/my-url?query=initialUrl' },
        );

        expect(screen.getByTestId('state-value').textContent).toBe(
            'initialUrl',
        );
        expect(window.location.href).toContain('my-url?query=initialUrl');
    });

    it('initializes correctly from localStorage', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'initialStorage' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{ query: StringParam }}
            />,
            { route: '/my-url' },
        );

        expect(screen.getByTestId('state-value').textContent).toBe(
            'initialStorage',
        );
        expect(window.location.href).toContain('my-url?query=initialStorage');
    });

    it('initializes correctly from localStorage and URL', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'initialStorage' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{ query: StringParam }}
            />,
            { route: '/my-url?query=initialUrl' },
        );

        expect(screen.getByTestId('state-value').textContent).toBe(
            'initialUrl',
        );
        expect(window.location.href).toContain('my-url?query=initialUrl');
    });

    it('partially updates the state on button click', async () => {
        createLocalStorage('testKey', {}).setValue({
            query: 'before',
            other: 'other',
        });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: StringParam,
                    other: StringParam,
                }}
            />,
            { route: '/my-url' },
        );

        expect(screen.getByTestId('state-value').textContent).toBe('before');

        screen.getByText('Update State').click();

        expect(screen.getByTestId('state-value').textContent).toBe('after');
        expect(window.location.href).toContain(
            'my-url?query=after&other=other',
        );

        await waitFor(() => {
            const { value } = createLocalStorage('testKey', {});
            expect(value).toStrictEqual({ query: 'after', other: 'other' });
        });
    });

    it('omits offset in local storage', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'before' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: StringParam,
                    offset: NumberParam,
                }}
            />,
            { route: '/my-url' },
        );

        screen.getByText('Update Offset').click();
        screen.getByText('Update State').click();

        expect(window.location.href).toContain('my-url?query=after&offset=20');

        await waitFor(() => {
            const { value } = createLocalStorage('testKey', {});
            expect(value).toStrictEqual({ query: 'after' });
        });
    });
});
