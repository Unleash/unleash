import { useAvgTimeToProduction } from './useAvgTimeToProduction';

describe('useAvgTimeToProduction', () => {
    test('returns 0 when projectsData is empty', () => {
        const projectsData = {};
        const average = useAvgTimeToProduction(projectsData);
        expect(average).toBe(0);
    });

    test('calculates average time to production correctly', () => {
        const projectsData = {
            project1: [{ timeToProduction: 10 }, { timeToProduction: 20 }],
            project2: [{ timeToProduction: 15 }, { timeToProduction: 25 }],
        } as any;
        const average = useAvgTimeToProduction(projectsData);
        // Average of (10 + 20 + 15 + 25) / 4 = 17.5
        expect(average).toBe(17.5);
    });

    test('ignores projects without time to production data', () => {
        const projectsData = {
            project1: [{ timeToProduction: 10 }, { timeToProduction: 20 }],
            project2: [], // No time to production data
        } as any;
        const average = useAvgTimeToProduction(projectsData);
        // Average of (10 + 20) / 2 = 15
        expect(average).toBe(15);
    });
});
