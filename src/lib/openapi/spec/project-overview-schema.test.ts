import { validateSchema } from '../validate';
import type { ProjectOverviewSchema } from './project-overview-schema';

test('projectOverviewSchema', () => {
    const data: ProjectOverviewSchema = {
        name: 'project',
        version: 3,
        featureNaming: {
            description: 'naming description',
            example: 'a',
            pattern: '[aZ]',
        },
        featureTypeCounts: [
            {
                type: 'release',
                count: 1,
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/projectOverviewSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/projectOverviewSchema', {}),
    ).toMatchSnapshot();
});
