import { DeprecatedProjectOverviewSchema } from './deprecated-project-overview-schema';
import { validateSchema } from '../validate';

test('updateProjectEnterpriseSettings schema', () => {
    const data: DeprecatedProjectOverviewSchema = {
        name: 'project',
        version: 3,
        featureNaming: {
            description: 'naming description',
            example: 'a',
            pattern: '[aZ]',
        },
    };

    expect(
        validateSchema('#/components/schemas/projectOverviewSchema', data),
    ).toBeUndefined();

    expect(
        validateSchema('#/components/schemas/projectOverviewSchema', {}),
    ).toMatchSnapshot();
});
