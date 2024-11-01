import type { Db, IUnleashConfig } from '../../server-impl';
import { ProjectStatusService } from './project-status-service';

export const createProjectStatusService = (
    db: Db,
    config: IUnleashConfig,
): ProjectStatusService => {
    return new ProjectStatusService();
};

export const createFakeProjectStatusService = () => {
    const projectStatusService = new ProjectStatusService();

    return {
        projectStatusService,
    };
};
