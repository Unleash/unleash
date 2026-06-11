import { describe, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { usePersistentTableState } from './usePersistentTableState.ts';
import { Route, Routes } from 'react-router';
import { createLocalStorage } from '../utils/createLocalStorage.ts';
import {
    filterItemQueryParam,
    safeNumberQueryParam,
    stringArrayQueryParam,
    stringQueryParam,
    type QueryParamSpecMap,
} from '../utils/queryParamSpec.ts';

// Same scenarios as usePersistentTableState.test.tsx, but with the flag
// flipped so nuqs is the primary library. The extra waitFors compared to
// the use-query-params variant are expected: nuqs applies state
// optimistically and flushes URL updates asynchronously.
vi.mock('./useQueryStateLibrary.ts', () => ({
    useQueryStateLibrary: () => ({ primary: 'nuqs', compare: false }),
}));

type TestComponentProps = {
    keyName: string;
    queryParamsDefinition: QueryParamSpecMap;
    nonPersistentParams?: string[];
};

function TestComponent({
    keyName,
    queryParamsDefinition,
    nonPersistentParams,
}: TestComponentProps) {
    const [tableState, setTableState] = usePersistentTableState(
        keyName,
        queryParamsDefinition,
        nonPersistentParams,
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
                        <span data-testid='state-keys'>
                            {Object.keys(tableState).join(',')}
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

describe('usePersistentTableState (nuqs primary)', () => {
    it('initializes correctly from URL', async () => {
        createLocalStorage('testKey', {});

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{ query: stringQueryParam }}
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
                queryParamsDefinition={{ query: stringQueryParam }}
            />,
            { route: '/my-url' },
        );

        await waitFor(() => {
            expect(screen.getByTestId('state-value').textContent).toBe(
                'initialStorage',
            );
        });
        expect(window.location.href).toContain('my-url?query=initialStorage');
    });

    it('initializes correctly from localStorage with complex decoder', async () => {
        createLocalStorage('testKey', {}).setValue({
            query: 'initialStorage',
            filterItem: {
                operator: 'IS',
                values: ['default'],
            },
            columns: ['a', 'b'],
        });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: stringQueryParam,
                    filterItem: filterItemQueryParam,
                    columns: stringArrayQueryParam,
                }}
            />,
            { route: '/my-url' },
        );

        await waitFor(() => {
            expect(screen.getByTestId('state-value').textContent).toBe(
                'initialStorage',
            );
        });
        expect(window.location.href).toContain(
            'my-url?query=initialStorage&filterItem=IS%3Adefault&columns=a&columns=b',
        );
    });

    it('initializes correctly from localStorage and URL', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'initialStorage' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{ query: stringQueryParam }}
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
                    query: stringQueryParam,
                    other: stringQueryParam,
                }}
            />,
            { route: '/my-url' },
        );

        await waitFor(() => {
            expect(screen.getByTestId('state-value').textContent).toBe(
                'before',
            );
        });

        (await screen.findByText('Update State')).click();

        expect((await screen.findByTestId('state-value')).textContent).toBe(
            'after',
        );
        await waitFor(() => {
            expect(window.location.href).toContain(
                'my-url?query=after&other=other',
            );
        });

        await waitFor(() => {
            const { value } = createLocalStorage('testKey', {});
            expect(value).toStrictEqual({
                query: 'after',
                other: 'other',
            });
        });
    });

    it('omits offset in local storage', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'before' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: stringQueryParam,
                    offset: safeNumberQueryParam,
                }}
            />,
            { route: '/my-url' },
        );

        screen.getByText('Update Offset').click();
        screen.getByText('Update State').click();

        await waitFor(() => {
            expect(window.location.href).toContain(
                'my-url?query=after&offset=0',
            );
        });

        await waitFor(() => {
            const { value } = createLocalStorage('testKey', {});
            expect(value).toStrictEqual({ query: 'after' });
        });
    });

    it('resets offset to 0 on state update', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'before' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: stringQueryParam,
                    offset: safeNumberQueryParam,
                }}
            />,
            { route: '/my-url?query=before&offset=10' },
        );

        expect(window.location.href).toContain('my-url?query=before&offset=10');

        screen.getByText('Update State').click();

        await waitFor(() => {
            expect(window.location.href).toContain(
                'my-url?query=after&offset=0',
            );
            expect(window.location.href).not.toContain('offset=10');
        });
    });

    it('does not reset offset to 0 without offset decoder', async () => {
        createLocalStorage('testKey', {}).setValue({ query: 'before' });

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: stringQueryParam,
                }}
            />,
            { route: '/my-url?query=before&offset=10' },
        );

        expect(window.location.href).toContain('my-url?query=before&offset=10');

        screen.getByText('Update State').click();

        await waitFor(() => {
            expect(window.location.href).toContain(
                'my-url?query=after&offset=10',
            );
        });
    });

    it('maintains key order', async () => {
        createLocalStorage('testKey', {});

        render(
            <TestComponent
                keyName='testKey'
                queryParamsDefinition={{
                    query: stringQueryParam,
                    another: stringQueryParam,
                    ignore: stringQueryParam,
                }}
            />,
            { route: '/my-url?another=another&query=initialUrl' },
        );

        expect(screen.getByTestId('state-keys').textContent).toBe(
            'another,query,ignore',
        );

        await waitFor(() => {
            const { value } = createLocalStorage('testKey', {});
            expect(Object.keys(value)).toStrictEqual(['another', 'query']);
        });
    });
});
