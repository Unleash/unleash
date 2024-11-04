import { validateSchema } from '../validate';
import type { ProjectStatusSchema } from './project-status-schema';

test('projectStatusSchema', () => {
    const data: ProjectStatusSchema = {
        activityCountByDate: [
            { date: '2022-12-14', count: 2 },
            { date: '2022-12-15', count: 5 },
        ],
    };

    expect(
        validateSchema('#/components/schemas/projectStatusSchema', data),
    ).toBeUndefined();
});
