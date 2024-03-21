import { useMedianTimeToProduction } from './useMedianTimeToProduction';
import { renderHook } from '@testing-library/react-hooks';

describe('useMedianTimeToProduction', () => {
    test('returns 0 when projectsData is empty', () => {
        const projectsData = {};
        const { result } = renderHook(() =>
            useMedianTimeToProduction(projectsData),
        );
        expect(result.current).toBe(0);
    });

    test('calculates median time to production correctly with even number of projects', () => {
        const projectsData = {
            project1: [
                { timeToProduction: 10, date: '2023-01-01' },
                { timeToProduction: 20, date: '2023-02-01' },
            ],
            project2: [
                { timeToProduction: 15, date: '2023-01-15' },
                { timeToProduction: 25, date: '2023-02-15' },
            ],
            project3: [{ timeToProduction: 30, date: '2023-01-20' }],
        } as any;
        const { result } = renderHook(() =>
            useMedianTimeToProduction(projectsData),
        );
        // With sorted timeToProductions [10, 15, 20, 25, 30], median is the middle value, 20.
        expect(result.current).toBe(20);
    });

    test('calculates median time to production correctly with odd number of projects', () => {
        const projectsData = {
            project1: [
                { timeToProduction: 10, date: '2023-01-01' },
                { timeToProduction: 20, date: '2023-02-01' },
            ],
            project2: [{ timeToProduction: 15, date: '2023-01-15' }],
        } as any;
        const { result } = renderHook(() =>
            useMedianTimeToProduction(projectsData),
        );
        // With sorted timeToProductions [10, 15, 20], median is the middle value, 15.
        expect(result.current).toBe(15);
    });

    test('correctly handles all valid time to production values', () => {
        const projectsData = {
            project1: [{ timeToProduction: 10, date: '2023-01-01' }],
            project2: [{ timeToProduction: 25, date: '2023-01-10' }],
            project3: [{ date: '2023-01-15' }],
            project4: [
                { timeToProduction: 30, date: '2023-02-01' },
                { timeToProduction: 20, date: '2023-02-02' },
            ],
        } as any;
        const { result } = renderHook(() =>
            useMedianTimeToProduction(projectsData),
        );
        // With sorted timeToProductions [10, 20, 25, 30], the median is the average of 20 and 25, i.e., 22.5.
        expect(result.current).toBe(22.5);
    });
});
