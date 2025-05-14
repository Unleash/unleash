import type {
    IAuditUser,
    IFlagResolver,
    IUnleashConfig,
} from '../../types/index.js';
import { createFakeProjectService } from './createProjectService.js';
import type { IUser } from '../../types/index.js';
import { createTestConfig } from '../../../test/config/test-config.js';

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

test('Should not allow to exceed project limit on create', async () => {
    const LIMIT = 1;
    const { projectService } = createFakeProjectService({
        ...createTestConfig(),
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: { projects: LIMIT },
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

test('Should not allow to exceed project limit on revive', async () => {
    const LIMIT = 1;
    const { projectService } = createFakeProjectService({
        ...createTestConfig(),
        flagResolver: alwaysOnFlagResolver,
        resourceLimits: { projects: LIMIT },
        eventBus: {
            emit: () => {},
        },
    } as unknown as IUnleashConfig);

    const createProject = (name: string) =>
        projectService.createProject(
            { name, id: name },
            {} as IUser,
            {} as IAuditUser,
        );
    const archiveProject = (id: string) =>
        projectService.archiveProject(id, {} as IAuditUser);
    const reviveProject = (id: string) =>
        projectService.reviveProject(id, {} as IAuditUser);

    await createProject('projectA');
    await archiveProject('projectA');
    await createProject('projectB');

    await expect(() => reviveProject('projectA')).rejects.toThrow(
        "Failed to create project. You can't create more than the established limit of 1.",
    );
});
