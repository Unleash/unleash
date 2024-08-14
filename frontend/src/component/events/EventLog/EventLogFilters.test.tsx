import { renderHook } from '@testing-library/react';
import { useEventLogFilters } from './EventLogFilters';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const allFilterKeys = ['from', 'to', 'createdBy', 'type', 'project', 'feature'];

allFilterKeys.sort();

const server = testServerSetup();
testServerRoute(server, '/api/admin/projects', {
    projects: [
        { id: 'project1', name: 'Project 1' },
        { id: 'project2', name: 'Project 2' },
    ],
});

test('When the log type is flag, you should not get filters for project and feature', () => {
    const { result } = renderHook(() => useEventLogFilters('flag'));
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).toEqual(
        allFilterKeys.filter((key) => key !== 'project' && key !== 'feature'),
    );
});

test('When the log type is project, you should not get filters for project', () => {
    const { result } = renderHook(() => useEventLogFilters('project'));
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).toEqual(
        allFilterKeys.filter((key) => key !== 'project'),
    );
});

test('When the log type is global, you should get all filters', () => {
    const { result } = renderHook(() => useEventLogFilters('global'));
    const filterKeys = result.current.map((filter) => filter.filterKey);
    filterKeys.sort();

    expect(filterKeys).toEqual(allFilterKeys);
});
