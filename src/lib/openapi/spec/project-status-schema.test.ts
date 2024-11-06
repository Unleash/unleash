import { validateSchema } from '../validate';
import type { ProjectStatusSchema } from './project-status-schema';

test('projectStatusSchema', () => {
    const data: ProjectStatusSchema = {
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
