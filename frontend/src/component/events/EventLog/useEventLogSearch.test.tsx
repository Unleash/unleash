import { afterEach, describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter7Adapter } from 'utils/ReactRouter7Adapter';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import {
    calculatePaginationInfo,
    useEventLogSearch,
} from './useEventLogSearch.js';

vi.mock('hooks/api/getters/useEventSearch/useEventSearch', () => ({
    useEventSearch: vi.fn(() => ({ events: [], total: 0, loading: false })),
}));

describe('event log date filters', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderEventLogSearch = (search = '') =>
        renderHook(() => useEventLogSearch({ type: 'global' }), {
            wrapper: ({ children }) => (
                <MemoryRouter initialEntries={[`/events${search}`]}>
                    <QueryParamProvider adapter={ReactRouter7Adapter}>
                        {children}
                    </QueryParamProvider>
                </MemoryRouter>
            ),
        });

    test.each([
        [
            'America/Los_Angeles',
            '2026-09-11T01:30:00Z',
            '2025-09-11',
            '2026-09-11',
        ],
        [
            'America/Los_Angeles',
            '2027-01-01T01:30:00Z',
            '2026-01-01',
            '2027-01-01',
        ],
        [
            'America/Los_Angeles',
            '2025-03-01T01:30:00Z',
            '2024-03-01',
            '2025-03-01',
        ],
        [
            'America/Los_Angeles',
            '2024-02-29T01:30:00Z',
            '2023-02-28',
            '2024-02-29',
        ],
        [
            'Pacific/Auckland',
            '2026-09-10T23:30:00Z',
            '2025-09-10',
            '2026-09-10',
        ],
        ['UTC', '2026-09-11T01:30:00Z', '2025-09-11', '2026-09-11'],
    ])('uses UTC default dates in %s at %s', (timeZone, now, startDate, endDate) => {
        vi.stubEnv('TZ', timeZone);
        vi.useFakeTimers();
        vi.setSystemTime(new Date(now));

        renderEventLogSearch();

        expect(useEventSearch).toHaveBeenLastCalledWith(
            expect.objectContaining({
                from: `IS:${startDate}`,
                to: `IS:${endDate}`,
            }),
            expect.anything(),
        );
    });

    test('preserves an explicit date range from the URL', () => {
        vi.stubEnv('TZ', 'America/Los_Angeles');
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-11T01:30:00Z'));

        renderEventLogSearch('?from=IS:2026-09-01&to=IS:2026-09-10');

        expect(useEventSearch).toHaveBeenLastCalledWith(
            expect.objectContaining({
                from: 'IS:2026-09-01',
                to: 'IS:2026-09-10',
            }),
            expect.anything(),
        );
    });
});

test.each([
    [{ offset: 5, pageSize: 2 }, { currentPage: 2 }],
    [{ offset: 6, pageSize: 2 }, { currentPage: 3 }],
])('it calculates currentPage correctly', (input, output) => {
    const result = calculatePaginationInfo(input);
    expect(result).toMatchObject(output);
});

test("it doesn't try to divide by zero", () => {
    const result = calculatePaginationInfo({ offset: 0, pageSize: 0 });

    expect(result.currentPage).not.toBeNaN();
});

test('it calculates the correct offsets', () => {
    const result = calculatePaginationInfo({ offset: 50, pageSize: 25 });

    expect(result).toMatchObject({
        currentPage: 2,
        nextPageOffset: 75,
        previousPageOffset: 25,
    });
});

test(`it "fixes" offsets if you've set a weird offset`, () => {
    const result = calculatePaginationInfo({ offset: 35, pageSize: 25 });

    expect(result).toMatchObject({
        currentPage: 1,
        nextPageOffset: 50,
        previousPageOffset: 0,
    });
});
