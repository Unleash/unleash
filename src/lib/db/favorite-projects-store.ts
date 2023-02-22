import EventEmitter from 'events';
import { Logger, LogProvider } from '../logger';
import { IFavoriteProject } from '../types/favorites';
import {
    IFavoriteProjectKey,
    IFavoriteProjectsStore,
} from '../types/stores/favorite-projects';
import { Db } from './db';

const T = {
    FAVORITE_PROJECTS: 'favorite_projects',
};

interface IFavoriteProjectRow {
    user_id: number;
    project: string;
    created_at: Date;
}

const rowToFavorite = (row: IFavoriteProjectRow) => {
    return {
        userId: row.user_id,
        project: row.project,
        createdAt: row.created_at,
    };
};

export class FavoriteProjectsStore implements IFavoriteProjectsStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Db;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/favorites-store.ts');
    }

    async addFavoriteProject({
        userId,
        project,
    }: IFavoriteProjectKey): Promise<IFavoriteProject> {
        const insertedProject = await this.db<IFavoriteProjectRow>(
            T.FAVORITE_PROJECTS,
        )
            .insert({ project, user_id: userId })
            .onConflict(['user_id', 'project'])
            .merge()
            .returning('*');

        return rowToFavorite(insertedProject[0]);
    }

    async delete({ userId, project }: IFavoriteProjectKey): Promise<void> {
        return this.db(T.FAVORITE_PROJECTS)
            .where({ project, user_id: userId })
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(T.FAVORITE_PROJECTS).del();
    }

    destroy(): void {}

    async exists({ userId, project }: IFavoriteProjectKey): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.FAVORITE_PROJECTS} WHERE user_id = ? AND project = ?) AS present`,
            [userId, project],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get({
        userId,
        project,
    }: IFavoriteProjectKey): Promise<IFavoriteProject> {
        const favorite = await this.db
            .table<IFavoriteProjectRow>(T.FAVORITE_PROJECTS)
            .select()
            .where({ project, user_id: userId })
            .first();

        return rowToFavorite(favorite);
    }

    async getAll(): Promise<IFavoriteProject[]> {
        const groups = await this.db<IFavoriteProjectRow>(
            T.FAVORITE_PROJECTS,
        ).select();
        return groups.map(rowToFavorite);
    }
}
