import { validateSchema } from '../validate';
import { ProjectApplicationsSchema } from './project-applications-schema';

test('projectApplicationsSchema', () => {
    const data: ProjectApplicationsSchema = [
        {
            name: 'my-weba-app',
            lastSeenAt: '2023-01-28T15:21:39.975Z',
            environments: [
                {
                    name: 'development',
                    instances: [
                        {
                            id: 'app1:1:2',
                            lastSeenAt: '2023-01-28T15:21:39.975Z',
                            sdkVersion: '4.1.1',
                        },
                    ],
                },
            ],
        },
    ];

    expect(
        validateSchema('#/components/schemas/projectApplicationsSchema', data),
    ).toBeUndefined();
});
