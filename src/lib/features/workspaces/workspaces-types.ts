export interface IWorkspace {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    createdBy?: number;
}

export interface IWorkspaceCreate {
    name: string;
    description?: string;
    createdBy?: number;
}

export interface IWorkspaceUpdate {
    name?: string;
    description?: string;
}

export interface IWorkspaceStore {
    get(id: number): Promise<IWorkspace>;
    getAll(): Promise<IWorkspace[]>;
    create(workspace: IWorkspaceCreate): Promise<IWorkspace>;
    update(id: number, workspace: IWorkspaceUpdate): Promise<IWorkspace>;
    delete(id: number): Promise<void>;
    exists(id: number): Promise<boolean>;
    count(): Promise<number>;
}
