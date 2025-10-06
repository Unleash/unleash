import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends.ts';
import { calculateArchiveRatio } from './calculateArchiveRatio.ts';
import type { InstanceInsightsSchema } from 'openapi/index.ts';

describe('calculateArchiveRatio', () => {
    it('should return "N/A" when the data is empty', () => {
        expect(calculateArchiveRatio({})).toBe('N/A');
    });

    it('should return "N/A" when no flags have been created', () => {
        const result = calculateArchiveRatio({
            a: [
                {
                    week: '2024-53',
                    date: '2025-01-05T01:00:00.000Z',
                    project: 'a',
                    createdFlags: {
                        release: 0,
                    },
                    archivedFlags: 10,
                },
            ],
        });
        expect(result).toBe('N/A');
    });

    it('should count missing `createdFlags` and `archivedFlags` properties as 0', () => {
        const result = calculateArchiveRatio({
            project: [
                // @ts-expect-error: the type requires `createdFlags` to be present
                {
                    week: '2024-53',
                    date: '2025-01-05T01:00:00.000Z',
                    project: 'a',
                    archivedFlags: 1,
                },
                // @ts-expect-error: the type requires `archivedFlags` to be present
                {
                    week: '2024-53',
                    date: '2025-01-05T01:00:00.000Z',
                    project: 'a',
                    createdFlags: {
                        release: 1,
                    },
                },
            ],
        });
        expect(result).toBe('100%');
    });

    it('should count all flag types listed under createdFlags', () => {
        const input: GroupedDataByProject<
            InstanceInsightsSchema['creationArchiveTrends']
        > = {
            projectA: [
                {
                    week: '2025-40',
                    date: '2025-10-05T00:21:42.617Z',
                    project: 'projectA',
                    createdFlags: {
                        release: 1,
                        killswitch: 1,
                        experiment: 1,
                        operational: 1,
                        bogus: 1,
                    },
                    archivedFlags: 5,
                },
            ],
        };

        expect(calculateArchiveRatio(input)).toBe('100%');
    });

    it('should take the average of all data points', () => {
        const input: GroupedDataByProject<
            InstanceInsightsSchema['creationArchiveTrends']
        > = {
            projectA: [
                {
                    week: '2025-40',
                    date: '2025-10-05T00:21:42.617Z',
                    project: 'projectA',
                    createdFlags: {
                        release: 1,
                    },
                    archivedFlags: 2,
                },
                {
                    week: '2025-38',
                    date: '2025-09-22T10:36:58.612Z',
                    project: 'projectA',
                    createdFlags: {
                        killswitch: 6,
                    },
                    archivedFlags: 7,
                },
            ],
            projectB: [
                {
                    week: '2025-03',
                    date: '2025-01-19T01:00:00.000Z',
                    project: 'projectB',
                    createdFlags: {
                        release: 0,
                    },
                    archivedFlags: 5,
                },
            ],
        };

        expect(calculateArchiveRatio(input)).toBe('200%');
    });
});
