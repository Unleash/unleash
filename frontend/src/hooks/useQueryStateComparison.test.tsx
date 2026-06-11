import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { waitFor } from '@testing-library/react';
import { createParser } from 'nuqs';
import { StringParam } from 'use-query-params';
import { Route, Routes } from 'react-router';
import { usePersistentTableState } from './usePersistentTableState.ts';
import { createLocalStorage } from '../utils/createLocalStorage.ts';
import {
    filterItemQueryParam,
    safeNumberQueryParam,
    stringArrayQueryParam,
    stringQueryParam,
    withDefaultQueryParam,
    type QueryParamSpec,
} from '../utils/queryParamSpec.ts';
import { recordQueryStateDivergence } from '../utils/recordQueryStateDivergence.ts';

vi.mock('../utils/recordQueryStateDivergence.ts', () => ({
    recordQueryStateDivergence: vi.fn(),
}));

// the dummy flag config has compare: true, which is what these tests need

const TestComponent = ({ specs }: { specs: Record<string, any> }) => {
    usePersistentTableState('comparisonTestKey', specs);
    return (
        <Routes>
            <Route path='/my-url' element={<div>ready</div>} />
        </Routes>
    );
};

/** Decodes differently from use-query-params' StringParam on purpose. */
const decodeDivergentSpec: QueryParamSpec<string | null | undefined> = {
    uqp: StringParam,
    nuqs: createParser({
        parse(value) {
            return value.toUpperCase();
        },
        serialize(value) {
            return value;
        },
    }),
};

/** Decodes identically but encodes differently on purpose. */
const encodeDivergentSpec: QueryParamSpec<string | null | undefined> = {
    uqp: StringParam,
    nuqs: createParser({
        parse(value) {
            return value;
        },
        serialize(value) {
            return `${value}!`;
        },
    }),
};

describe('useQueryStateComparison', () => {
    beforeEach(() => {
        vi.mocked(recordQueryStateDivergence).mockClear();
        createLocalStorage('comparisonTestKey', {}).setValue({});
    });

    it('does not report divergence for the standard specs', async () => {
        render(
            <TestComponent
                specs={{
                    query: stringQueryParam,
                    offset: withDefaultQueryParam(safeNumberQueryParam, 0),
                    filterItem: filterItemQueryParam,
                    columns: stringArrayQueryParam,
                }}
            />,
            {
                route: '/my-url?query=hello&offset=10&filterItem=IS%3Aa%2Cb&columns=a&columns=b',
            },
        );

        // comparison runs in an effect; give it a tick before asserting
        await waitFor(() => {
            expect(recordQueryStateDivergence).not.toHaveBeenCalled();
        });
    });

    it('reports decode divergence with the diverging keys only', async () => {
        render(
            <TestComponent
                specs={{
                    query: decodeDivergentSpec,
                    stable: stringQueryParam,
                }}
            />,
            { route: '/my-url?query=hello&stable=same' },
        );

        await waitFor(() => {
            expect(recordQueryStateDivergence).toHaveBeenCalledWith({
                source: 'comparisonTestKey',
                kind: 'decode',
                keys: ['query'],
            });
        });
    });

    it('reports encode divergence when decoding agrees', async () => {
        render(<TestComponent specs={{ query: encodeDivergentSpec }} />, {
            route: '/my-url?query=hello',
        });

        await waitFor(() => {
            expect(recordQueryStateDivergence).toHaveBeenCalledWith({
                source: 'comparisonTestKey',
                kind: 'encode',
                keys: ['query'],
            });
        });
    });
});
