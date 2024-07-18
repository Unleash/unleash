import type { IAuditUser, IFlagResolver, IUnleashConfig } from '../../types';
import getLogger from '../../../test/fixtures/no-logger';
import { createFakeProjectService } from './createProjectService';
import type { IUser } from '../../types';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

test('Should not allow to exceed project limit', async () => {
    const LIMIT = 1;
    const projectService = createFakeProjectService({
        getLogger,
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: {
            projects: LIMIT,
        },
        eventBus: {
            emit: () => {},
        },
    } as unknown as IUnleashConfig);

    const createProject = (name: string) =>
        projectService.createProject({ name }, {} as IUser, {} as IAuditUser);

    await createProject('projectA');

    await expect(() => createProject('projectB')).rejects.toThrow(
        "Failed to create project. You can't create more than the established limit of 1.",
    );
});
