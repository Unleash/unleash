import { validateSchema } from '../validate';
import type { ProjectStatusSchema } from './project-status-schema';

test('projectStatusSchema', () => {
    const data: ProjectStatusSchema = {
        averageHealth: 50,
        lifecycleSummary: {
            initial: {
                currentFlags: 0,
                averageDays: null,
            },
            preLive: {
                currentFlags: 0,
                averageDays: null,
            },
            live: {
                currentFlags: 0,
                averageDays: null,
            },
            completed: {
                currentFlags: 0,
                averageDays: null,
            },
            archived: {
                currentFlags: 0,
                last30Days: 0,
            },
        },
        activityCountByDate: [
            { date: '2022-12-14', count: 2 },
            { date: '2022-12-15', count: 5 },
        ],
        resources: {
            connectedEnvironments: 2,
            apiTokens: 2,
            members: 1,
            segments: 0,
        },
    };

    expect(
        validateSchema('#/components/schemas/projectStatusSchema', data),
    ).toBeUndefined();
});
