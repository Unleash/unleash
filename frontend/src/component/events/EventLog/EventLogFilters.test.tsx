import { renderHook } from '@testing-library/react';
import { useEventLogFilters } from './EventLogFilters';

const allFilterKeys = ['from', 'to', 'createdBy', 'type', 'project', 'feature'];

allFilterKeys.sort();

test('When you have no projects or flags, you should not get a project or flag filters', () => {
    const { result } = renderHook(() =>
        useEventLogFilters(
            () => ({ projects: [] }),
            () => ({ features: [] }),
        ),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).not.toContain('project');
    expect(filterKeys).not.toContain('feature');
});

test('When you have no projects, you should not get a project filter', () => {
    const { result } = renderHook(() =>
        useEventLogFilters(
            () => ({ projects: [] }),
            // @ts-expect-error: omitting other properties we don't need
            () => ({ features: [{ name: 'flag' }] }),
        ),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).not.toContain('project');
});

test('When you have only one project, you should not get a project filter', () => {
    const { result } = renderHook(() =>
        useEventLogFilters(
            // @ts-expect-error: omitting other properties we don't need
            () => ({ projects: [{ id: 'a', name: 'A' }] }),
            () => ({ features: [] }),
        ),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).not.toContain('project');
});

test('When you have two one project, you should not get a project filter', () => {
    const { result } = renderHook(() =>
        useEventLogFilters(
            () => ({
                projects: [
                    // @ts-expect-error: omitting other properties we don't need
                    { id: 'a', name: 'A' },
                    // @ts-expect-error: omitting other properties we don't need
                    { id: 'b', name: 'B' },
                ],
            }),
            () => ({ features: [] }),
        ),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).toContain('project');
});
