import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useEventLogFilters } from './EventLogFilters.tsx';

const allFilterKeys = ['from', 'to', 'createdBy', 'type', 'project', 'feature'];

allFilterKeys.sort();

const renderWithRouter = (callback: () => any, initialEntries = ['/']) => {
    return renderHook(callback, {
        wrapper: ({ children }) => (
            <MemoryRouter initialEntries={initialEntries}>
                {children}
            </MemoryRouter>
        ),
    });
};

test('When you have no projects or flags, you should not get a project or flag filters', () => {
    const { result } = renderWithRouter(() => useEventLogFilters([], []));
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).not.toContain('project');
    expect(filterKeys).not.toContain('feature');
});

test('When you have no projects, you should not get a project filter', () => {
    const { result } = renderWithRouter(() =>
        useEventLogFilters(
            [],
            // @ts-expect-error: omitting other properties we don't need
            [{ name: 'flag' }],
        ),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).not.toContain('project');
});

test('When you have only one project, you should not get a project filter', () => {
    const { result } = renderWithRouter(() =>
        useEventLogFilters([{ id: 'a', name: 'A' }], []),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).not.toContain('project');
});

test('When you have two one project, you should not get a project filter', () => {
    const { result } = renderWithRouter(() =>
        useEventLogFilters(
            [
                { id: 'a', name: 'A' },
                { id: 'b', name: 'B' },
            ],
            [],
        ),
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).toContain('project');
});

test('When groupId is in URL params, should include groupId filter', () => {
    const { result } = renderWithRouter(
        () => useEventLogFilters([], []),
        ['/?groupId=IS:123'],
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);

    expect(filterKeys).toContain('groupId');
});

test('When no groupId in URL params, should not include groupId filter', () => {
    const { result } = renderWithRouter(() => useEventLogFilters([], []));
    const filterKeys = result.current.map((filter) => filter.filterKey);

    expect(filterKeys).not.toContain('groupId');
});

test('When id is in URL params, should include id filter', () => {
    const { result } = renderWithRouter(
        () => useEventLogFilters([], []),
        ['/?id=IS:456'],
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);

    expect(filterKeys).toContain('id');
});

test('When no id in URL params, should not include id filter', () => {
    const { result } = renderWithRouter(() => useEventLogFilters([], []));
    const filterKeys = result.current.map((filter) => filter.filterKey);

    expect(filterKeys).not.toContain('id');
});

test('When both id and groupId are in URL params, should include both filters', () => {
    const { result } = renderWithRouter(
        () => useEventLogFilters([], []),
        ['/?id=IS:456&groupId=IS:123'],
    );
    const filterKeys = result.current.map((filter) => filter.filterKey);

    expect(filterKeys).toContain('id');
    expect(filterKeys).toContain('groupId');
});
