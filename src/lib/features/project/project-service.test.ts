import { createTestConfig } from '../../../test/config/test-config';
import { RoleName } from '../../types';
import { createFakeProjectService } from './createProjectService';

describe('enterprise extension: enable change requests', () => {
    test('it calls the change request enablement function', async () => {
        expect.assertions(1);

        const config = createTestConfig();
        const service = createFakeProjectService(config);

        // @ts-expect-error: if we don't set this up, the test will fail due to a missing role.
        service.accessService.createRole({
            name: RoleName.OWNER,
            description: 'Project owner',
            createdByUserId: -1,
        });

        const projectId = 'fake-project-id';
        await service.createProject(
            {
                id: projectId,
                name: 'fake-project-name',
            },
            {
                id: 5,
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
