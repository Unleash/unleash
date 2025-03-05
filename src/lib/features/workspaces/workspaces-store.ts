import type { Db } from '../../db/db';
import type { Logger, LogProvider } from '../../logger';
import NotFoundError from '../../error/notfound-error';
import type { IFlagResolver } from '../../types';
import type {
    IWorkspace,
    IWorkspaceCreate,
    IWorkspaceStore,
    IWorkspaceUpdate,
} from './workspaces-types';

const COLUMNS = ['id', 'name', 'description', 'created_at', 'created_by'];
const T = {
    workspaces: 'workspaces',
};

interface IWorkspaceRow {
    id: number;
    name: string;
    description: string;
    created_at: Date;
    created_by: number;
}

const mapRow = (row: IWorkspaceRow): IWorkspace => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    createdBy: row.created_by,
});

class WorkspaceStore implements IWorkspaceStore {
    private db: Db;
    private logger: Logger;
    private flagResolver: IFlagResolver;

    constructor(db: Db, getLogger: LogProvider, flagResolver: IFlagResolver) {
        this.db = db;
        this.flagResolver = flagResolver;
        this.logger = getLogger('workspace-store.ts');
    }

    async getAll(): Promise<IWorkspace[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(T.workspaces)
            .orderBy('created_at', 'desc');
        return rows.map(mapRow);
    }

    async get(id: number): Promise<IWorkspace> {
        const row = await this.db
            .first(COLUMNS)
            .from(T.workspaces)
            .where({ id });

        if (!row) {
            throw new NotFoundError(`Could not find workspace with id ${id}`);
        }

        return mapRow(row);
    }

    async create(workspace: IWorkspaceCreate): Promise<IWorkspace> {
        const row = await this.db(T.workspaces)
            .insert({
                name: workspace.name,
                description: workspace.description,
                created_by: workspace.createdBy,
            })
            .returning('*');

        return mapRow(row[0]);
    }

    async update(id: number, workspace: IWorkspaceUpdate): Promise<IWorkspace> {
        const row = await this.db(T.workspaces)
            .where({ id })
            .update(workspace)
            .returning('*');

        return mapRow(row[0]);
    }

    async delete(id: number): Promise<void> {
        try {
            await this.db(T.workspaces).where({ id }).del();
        } catch (e) {
            console.log('e', e);
        }
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.workspaces} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async count(): Promise<number> {
        return this.db(T.workspaces)
            .count('*')
            .then((res) => Number(res[0].count));
    }

    destroy(): void {}
}

export default WorkspaceStore;
