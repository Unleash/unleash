import type {
    IWorkspace,
    IWorkspaceCreate,
    IWorkspaceStore,
    IWorkspaceUpdate,
} from './workspaces-types';
import NotFoundError from '../../error/notfound-error';

export class FakeWorkspaceStore implements IWorkspaceStore {
    private workspaces: IWorkspace[] = [
        {
            id: 1,
            name: 'Default',
            description: 'Default workspace',
            createdAt: new Date(),
            createdBy: 1,
        },
    ];

    async getAll(): Promise<IWorkspace[]> {
        return this.workspaces;
    }

    async get(id: number): Promise<IWorkspace> {
        const workspace = this.workspaces.find((w) => w.id === id);
        if (!workspace) {
            throw new NotFoundError(`Could not find workspace with id ${id}`);
        }
        return workspace;
    }

    async create(workspace: IWorkspaceCreate): Promise<IWorkspace> {
        const newWorkspace = {
            ...workspace,
            id: this.workspaces.length + 1,
            createdAt: new Date(),
        };
        this.workspaces.push(newWorkspace);
        return newWorkspace;
    }

    async update(id: number, workspace: IWorkspaceUpdate): Promise<IWorkspace> {
        const index = this.workspaces.findIndex((w) => w.id === id);
        if (index === -1) {
            throw new NotFoundError(`Could not find workspace with id ${id}`);
        }
        this.workspaces[index] = {
            ...this.workspaces[index],
            ...workspace,
        };
        return this.workspaces[index];
    }

    async delete(id: number): Promise<void> {
        const index = this.workspaces.findIndex((w) => w.id === id);
        if (index === -1) {
            throw new NotFoundError(`Could not find workspace with id ${id}`);
        }
        this.workspaces.splice(index, 1);
    }

    async exists(id: number): Promise<boolean> {
        return this.workspaces.some((w) => w.id === id);
    }

    async count(): Promise<number> {
        return this.workspaces.length;
    }

    destroy(): void {}
}

export default FakeWorkspaceStore;
