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

    test('calculates result.current time to production correctly', () => {
        const projectsData = {
            project1: [{ timeToProduction: 10 }, { timeToProduction: 20 }],
            project2: [{ timeToProduction: 15 }, { timeToProduction: 25 }],
        } as any;
        const { result } = renderHook(() =>
            useAvgTimeToProduction(projectsData),
        );
        expect(result.current).toBe(17.5);
    });

    test('ignores projects without time to production data', () => {
        const projectsData = {
            project1: [{ timeToProduction: 10 }, { timeToProduction: 20 }],
            project2: [],
        } as any;
        const { result } = renderHook(() =>
            useAvgTimeToProduction(projectsData),
        );
        expect(result.current).toBe(7.5);
    });
});
