import { renderHook } from '@testing-library/react';
import { useFilteredFlagsSummary } from './useFilteredFlagsSummary.js';

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
                    timeToProduction: 4,
                    health: 100,
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
                    timeToProduction: 5,
                    health: 100,
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
                    timeToProduction: 4,
                    health: 75,
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
                    timeToProduction: 2,
                    health: 80,
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
            medianTimeToProduction: 3,
            technicalDebt: '21',
        });
    });

    it('should work with project with zero users', () => {
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
                    timeToProduction: 4,
                    health: 100,
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
            technicalDebt: '0',
            medianTimeToProduction: 4,
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
                    timeToProduction: 2,
                    health: 100,
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
                    timeToProduction: 5,
                    health: 100,
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
            medianTimeToProduction: 3.5,
            technicalDebt: '0',
        });
    });

    it('should set health of a project without feature flags to undefined', () => {
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
                    timeToProduction: 0,
                    health: 100,
                },
            ]),
        );

        expect(result.current).toEqual({
            total: 0,
            active: 0,
            stale: 0,
            potentiallyStale: 0,
            averageUsers: 0,
            averageHealth: '100',
            medianTimeToProduction: undefined,
            technicalDebt: '0',
        });
    });

    it('should not use 0 timeToProduction projects for median calculation', () => {
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
                    timeToProduction: 0,
                    health: 100,
                },
                {
                    week: '2024-01',
                    project: 'project2',
                    total: 0,
                    active: 0,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 0,
                    date: '',
                    timeToProduction: 0,
                    health: 100,
                },
                {
                    week: '2024-01',
                    project: 'project3',
                    total: 0,
                    active: 0,
                    stale: 0,
                    potentiallyStale: 0,
                    users: 0,
                    date: '',
                    timeToProduction: 5,
                    health: 100,
                },
            ]),
        );

        expect(result.current).toEqual({
            total: 0,
            active: 0,
            stale: 0,
            potentiallyStale: 0,
            averageUsers: 0,
            averageHealth: '100',
            medianTimeToProduction: 5,
            technicalDebt: '0',
        });
    });
});
