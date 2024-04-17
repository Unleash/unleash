import { createTestConfig } from '../../../test/config/test-config';
import { createFakeProjectService } from './createProjectService';

describe('enterprise extension: enable change requests', () => {
    test('it calls the change request enablement function', async () => {
        const enableChangeRequests = jest.fn();

        const config = createTestConfig();
        const service = createFakeProjectService(config);
        await service.createProject(
            {
                id: 'fake-project-id',
                name: 'fake-project-name',
            },
            {
                id: 1,
                permissions: [],
                isAPI: false,
            },
            enableChangeRequests,
        );

        expect(enableChangeRequests).toHaveBeenCalled();
    });
});
