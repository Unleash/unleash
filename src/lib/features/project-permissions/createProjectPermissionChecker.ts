import { Db, IUnleashConfig } from 'lib/server-impl';
import ProjectPermissionStore from './projectPermissionStore';
import { ProjectPermissionChecker } from './projectPermissionChecker';
import { FakeProjectPermissionChecker } from './fakeProjectPermissionChecker';

export const createProjectPermissionChecker = (
    db: Db,
    config: IUnleashConfig,
): ProjectPermissionChecker => {
    const { getLogger } = config;
    const projectPermissionStore = new ProjectPermissionStore(db, getLogger);

    return new ProjectPermissionChecker({ projectPermissionStore });
};

export const createFakeProjectPermissionChecker =
    (): FakeProjectPermissionChecker => {
        return new FakeProjectPermissionChecker();
    };
