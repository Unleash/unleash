import { validateSchema } from '../validate';
import { ProjectApplicationsSchema } from './project-applications-schema';

test('projectApplicationsSchema', () => {
    const data: ProjectApplicationsSchema = [
        {
            appName: 'my-weba-app',
            instanceId: 'app1:3:4',
            sdkVersion: '4.1.1',
            environment: 'production',
        },
    ];

    expect(
        validateSchema('#/components/schemas/projectApplicationsSchema', data),
    ).toBeUndefined();
});
