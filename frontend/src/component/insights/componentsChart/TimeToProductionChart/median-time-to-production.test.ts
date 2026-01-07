import { medianTimeToProduction } from './median-time-to-production.js';
import type { InstanceInsightsSchema } from 'openapi';

describe('medianTimeToProduction', () => {
    it('calculates the median with a single date and an odd number of projects', () => {
        const projectsData = [
            { date: '2023-03-21', timeToProduction: 10 },
            { date: '2023-03-21', timeToProduction: 20 },
            { date: '2023-03-21', timeToProduction: 30 },
        ] as unknown as InstanceInsightsSchema['projectFlagTrends'];
        const expected = { '2023-03-21': 20 };
        expect(medianTimeToProduction(projectsData)).toEqual(expected);
    });

    it('calculates the median with a single date and an even number of projects', () => {
        const projectsData = [
            { date: '2023-03-22', timeToProduction: 10 },
            { date: '2023-03-22', timeToProduction: 20 },
            { date: '2023-03-22', timeToProduction: 30 },
            { date: '2023-03-22', timeToProduction: 40 },
        ] as unknown as InstanceInsightsSchema['projectFlagTrends'];
        const expected = { '2023-03-22': 25 };
        expect(medianTimeToProduction(projectsData)).toEqual(expected);
    });

    it('calculates the median for multiple dates with varying numbers of projects', () => {
        const projectsData = [
            { date: '2023-03-23', timeToProduction: 5 },
            { date: '2023-03-23', timeToProduction: 15 },
            { date: '2023-03-24', timeToProduction: 10 },
            { date: '2023-03-24', timeToProduction: 20 },
            { date: '2023-03-24', timeToProduction: 30 },
            { date: '2023-03-25', timeToProduction: 25 },
        ] as unknown as InstanceInsightsSchema['projectFlagTrends'];
        const expected = {
            '2023-03-23': 10,
            '2023-03-24': 20,
            '2023-03-25': 25,
        };
        expect(medianTimeToProduction(projectsData)).toEqual(expected);
    });
});
