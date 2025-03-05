import type { Logger } from '../../logger';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashStores } from '../../types/stores';
import { NameExistsError } from '../../error';
import type EventService from '../events/event-service';
import type {
    IWorkspaceStore,
    IWorkspace,
    IWorkspaceCreate,
    IWorkspaceUpdate,
} from './workspaces-types';
import type { IAuditUser } from '../../types';
import {
    WorkspaceCreatedEvent,
    WorkspaceUpdatedEvent,
    WorkspaceDeletedEvent,
} from '../../types/events';

const WORKSPACE_NAME_SCHEMA = {
    validate: async (name: string) => {
        if (!name.match(/^[a-zA-Z0-9_ -]+$/)) {
            throw new Error(
                'Workspace name can only contain letters, numbers, spaces, "_" and "-"',
            );
        }
    },
};

class WorkspacesService {
    private logger: Logger;
    private workspaceStore: IWorkspaceStore;
    private eventService: EventService;

    constructor(
        { workspaceStore }: Pick<IUnleashStores, 'workspaceStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.workspaceStore = workspaceStore;
        this.eventService = eventService;
        this.logger = getLogger('services/workspaces-service.ts');
    }

    async getAll(): Promise<IWorkspace[]> {
        return this.workspaceStore.getAll();
    }

    async get(id: number): Promise<IWorkspace> {
        return this.workspaceStore.get(id);
    }

    async create(
        workspace: IWorkspaceCreate,
        user: IAuditUser,
    ): Promise<IWorkspace> {
        await this.validateUniqueName(workspace.name);
        await WORKSPACE_NAME_SCHEMA.validate(workspace.name);

        const createdWorkspace = await this.workspaceStore.create({
            ...workspace,
            createdBy: user.id,
        });

        await this.eventService.storeEvent(
            new WorkspaceCreatedEvent({
                workspace: createdWorkspace,
                auditUser: user,
            }),
        );

        return createdWorkspace;
    }

    async update(
        id: number,
        workspace: IWorkspaceUpdate,
        user: IAuditUser,
    ): Promise<IWorkspace> {
        const existingWorkspace = await this.workspaceStore.get(id);

        if (workspace.name) {
            await WORKSPACE_NAME_SCHEMA.validate(workspace.name);
            if (workspace.name !== existingWorkspace.name) {
                await this.validateUniqueName(workspace.name);
            }
        }

        const updatedWorkspace = await this.workspaceStore.update(
            id,
            workspace,
        );

        await this.eventService.storeEvent(
            new WorkspaceUpdatedEvent({
                workspace: updatedWorkspace,
                preWorkspace: existingWorkspace,
                auditUser: user,
            }),
        );

        return updatedWorkspace;
    }

    async delete(id: number, user: IAuditUser): Promise<void> {
        if (id === 1) {
            throw new Error('Cannot delete the default Unleash workspace');
        }

        const workspace = await this.workspaceStore.get(id);
        await this.workspaceStore.delete(id);

        await this.eventService.storeEvent(
            new WorkspaceDeletedEvent({
                workspace: workspace,
                auditUser: user,
            }),
        );
    }

    private async validateUniqueName(name: string): Promise<void> {
        const workspaces = await this.workspaceStore.getAll();
        const nameExists = workspaces.some(
            (workspace) => workspace.name.toLowerCase() === name.toLowerCase(),
        );

        if (nameExists) {
            throw new NameExistsError(
                'A workspace with that name already exists',
            );
        }
    }
}

export { WorkspacesService };
