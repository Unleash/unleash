import { createTestConfig } from '../../../test/config/test-config';
import { createFakeProjectService } from './createProjectService';

describe('enterprise extension: enable change requests', () => {
    test('it calls the change request enablement function', async () => {
        expect.assertions(1);

        const config = createTestConfig();
        const service = createFakeProjectService(config);

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
            },
            {
                id: 1,
                permissions: [],
                isAPI: false,
            },
            async () => {
                // @ts-expect-error: we want to verify that the project /has/
                // been created when calling the function.
                const project = await service.projectStore.get(projectId);

                expect(project).toBeTruthy();
            },
        );
    });
});
