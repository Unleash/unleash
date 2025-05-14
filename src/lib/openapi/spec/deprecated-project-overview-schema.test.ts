import type { DeprecatedProjectOverviewSchema } from './deprecated-project-overview-schema.js';
import { validateSchema } from '../validate.js';

test('deprecatedProjectOverviewSchema', () => {
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
        validateSchema(
            '#/components/schemas/deprecatedProjectOverviewSchema',
            data,
        ),
    ).toBeUndefined();

    expect(
        validateSchema(
            '#/components/schemas/deprecatedProjectOverviewSchema',
            {},
        ),
    ).toMatchSnapshot();
});
