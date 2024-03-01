import { renderHook } from '@testing-library/react-hooks';
import { useFilteredFlagsSummary } from './useFilteredFlagsSummary';

describe('useFilteredFlagTrends', () => {
    it('should summarize only last week of project flag trends', () => {
        const { result } = renderHook(() =>
            useFilteredFlagsSummary([
                {
                    week: '2024-01',
                    project: 'project1',
                    total: 1,
                    active: 1,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 1,
                    date: '',
                },
                {
                    week: '2024-01',
                    project: 'project2',
                    total: 2,
                    active: 2,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 2,
                    date: '',
                },
                {
                    week: '2024-02',
                    project: 'project1',
                    total: 4,
                    active: 3,
                    stale: 0,
                    potentiallyStale: 1,
                    users: 1,
                    date: '',
                },
                {
                    week: '2024-02',
                    project: 'project3',
                    total: 10,
                    active: 8,
                    stale: 2,
                    potentiallyStale: 0,
                    users: 3,
                    date: '',
                },
            ]),
        );

        expect(result.current).toEqual({
            total: 14,
            active: 11,
            stale: 2,
            potentiallyStale: 1,
            averageUsers: 2,
            averageHealth: '79',
        });
    });

    it('should work with project with zero users', () => {
        const { result, rerender } = renderHook(() =>
            useFilteredFlagsSummary([
                {
                    week: '2024-01',
                    project: 'project1',
                    total: 5,
                    active: 5,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 0,
                    date: '',
                },
            ]),
        );

        expect(result.current).toEqual({
            total: 5,
            active: 5,
            stale: 0,
            potentiallyStale: 0,
            averageUsers: 0,
            averageHealth: '100',
        });
    });

    it('should work with projects where some have with zero users', () => {
        const { result } = renderHook(() =>
            useFilteredFlagsSummary([
                {
                    week: '2024-01',
                    project: 'project1',
                    total: 5,
                    active: 5,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 0,
                    date: '',
                },
                {
                    week: '2024-01',
                    project: 'project2',
                    total: 5,
                    active: 5,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 3,
                    date: '',
                },
            ]),
        );

        expect(result.current).toEqual({
            total: 10,
            active: 10,
            stale: 0,
            potentiallyStale: 0,
            averageUsers: 1.5,
            averageHealth: '100',
        });
    });

    it('should set health of a project without feature toggles to undefined', () => {
        const { result } = renderHook(() =>
            useFilteredFlagsSummary([
                {
                    week: '2024-01',
                    project: 'project1',
                    total: 0,
                    active: 0,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 0,
                    date: '',
                },
            ]),
        );

        expect(result.current).toEqual({
            total: 0,
            active: 0,
            stale: 0,
            potentiallyStale: 0,
            averageUsers: 0,
            averageHealth: undefined,
        });
    });
});
