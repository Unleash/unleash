import { useAvgTimeToProduction } from './useAvgTimeToProduction';
import { renderHook } from '@testing-library/react-hooks';

describe('useAvgTimeToProduction', () => {
    test('returns 0 when projectsData is empty', () => {
        const projectsData = {};
        const { result } = renderHook(() =>
            useAvgTimeToProduction(projectsData),
        );
        expect(result.current).toBe(0);
    });

    test('calculates average time to production based on the latest date correctly', () => {
        const projectsData = {
            project1: [
                { timeToProduction: 10, date: '2023-01-01' },
                { timeToProduction: 20, date: '2023-02-01' }, // Latest for project1
            ],
            project2: [
                { timeToProduction: 15, date: '2023-01-15' },
                { timeToProduction: 25, date: '2023-02-15' }, // Latest for project2
            ],
        } as any;
        const { result } = renderHook(() =>
            useAvgTimeToProduction(projectsData),
        );
        // Expect average of the latest timeToProductions (20 from project1 and 25 from project2)
        expect(result.current).toBe(22.5);
    });

    test('ignores projects without time to production data in their latest entries', () => {
        const projectsData = {
            project1: [
                { timeToProduction: 10, date: '2023-01-01' },
                { timeToProduction: 20, date: '2023-02-01' }, // Latest and valid for project1
            ],
            project2: [
                { date: '2023-01-15' }, // Latest but no timeToProduction
                { timeToProduction: 25, date: '2023-01-10' },
            ],
        } as any;
        const { result } = renderHook(() =>
            useAvgTimeToProduction(projectsData),
        );
        // Since project2's latest entry doesn't have timeToProduction, only project1's latest is considered
        expect(result.current).toBe(20);
    });
});
