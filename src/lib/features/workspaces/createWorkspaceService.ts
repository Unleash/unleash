import type { Db, IUnleashConfig } from '../../server-impl';
import { WorkspacesService } from './workspaces-service';
import WorkspaceStore from './workspaces-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import FakeWorkspaceStore from './fake-workspace-store';

export const createWorkspaceService = (
    db: Db,
    config: IUnleashConfig,
): WorkspacesService => {
    const { getLogger, flagResolver } = config;
    const workspaceStore = new WorkspaceStore(db, getLogger, flagResolver);
    const eventService = createEventsService(db, config);

    return new WorkspacesService({ workspaceStore }, config, eventService);
};

export const createFakeWorkspaceService = (
    config: IUnleashConfig,
): WorkspacesService => {
    const workspaceStore = new FakeWorkspaceStore();
    const eventService = createFakeEventsService(config);

    return new WorkspacesService({ workspaceStore }, config, eventService);
};
