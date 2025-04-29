import { validateSchema } from '../validate.js';
import type { ProjectApplicationsSchema } from './project-applications-schema.js';

test('projectApplicationsSchema', () => {
    const data: ProjectApplicationsSchema = {
        total: 55,
        applications: [
            {
                name: 'my-weba-app',
                environments: ['development', 'production'],
                instances: ['instance-414122'],
                sdks: [
                    {
                        name: 'unleash-client-node',
                        versions: ['4.1.1'],
                    },
                ],
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/projectApplicationsSchema', data),
    ).toBeUndefined();
});
