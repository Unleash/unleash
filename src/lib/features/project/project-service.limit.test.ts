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
    } as unknown as IUnleashConfig);

    const createProject = (name: string) =>
        projectService.createProject({ name }, {} as IUser, {} as IAuditUser);

    await createProject('projectA');

    await expect(() => createProject('projectB')).rejects.toThrow(
        "Failed to create project. You can't create more than the established limit of 1.",
    );
});

test('Should enforce minimum project limit of 1', async () => {
    const INVALID_LIMIT = 0;
    const projectService = createFakeProjectService({
        getLogger,
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: {
            projects: INVALID_LIMIT,
        },
    } as unknown as IUnleashConfig);

    const createProject = (name: string) =>
        projectService.createProject({ name }, {} as IUser, {} as IAuditUser);

    // allow to create one project
    await createProject('projectA');

    await expect(() => createProject('projectB')).rejects.toThrow(
        "Failed to create project. You can't create more than the established limit of 1.",
    );
});
