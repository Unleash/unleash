import type EventEmitter from 'events';
import type { LogProvider } from '../logger.js';
import type { IFavoriteProject } from '../types/favorites.js';
import type {
    IFavoriteProjectKey,
    IFavoriteProjectsStore,
} from '../types/stores/favorite-projects.js';
import type { Db } from './db.js';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';

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
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter, _getLogger: LogProvider) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'favorite_projects',
                action,
            });
    }

    async addFavoriteProject({
        userId,
        project,
    }: IFavoriteProjectKey): Promise<IFavoriteProject> {
        const stop = this.timer('insertFavoriteProject');
        const insertedProject = await this.db<IFavoriteProjectRow>(
            T.FAVORITE_PROJECTS,
        )
            .insert({ project, user_id: userId })
            .onConflict(['user_id', 'project'])
            .merge()
            .returning('*');
        stop();
        return rowToFavorite(insertedProject[0]);
    }

    async delete({ userId, project }: IFavoriteProjectKey): Promise<void> {
        const stop = this.timer('deleteFavoriteProject');
        await this.db(T.FAVORITE_PROJECTS)
            .where({ project, user_id: userId })
            .del();
        stop();
    }

    async deleteAll(): Promise<void> {
        const stop = this.timer('deleteAll');
        await this.db(T.FAVORITE_PROJECTS).del();
        stop();
    }

    destroy(): void {}

    async exists({ userId, project }: IFavoriteProjectKey): Promise<boolean> {
        const stop = this.timer('favoriteProjectExists');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.FAVORITE_PROJECTS} WHERE user_id = ? AND project = ?) AS present`,
            [userId, project],
        );
        const { present } = result.rows[0];
        stop();
        return present;
    }

    async get({
        userId,
        project,
    }: IFavoriteProjectKey): Promise<IFavoriteProject> {
        const stop = this.timer('getFavoriteProject');
        const favorite = await this.db
            .table<IFavoriteProjectRow>(T.FAVORITE_PROJECTS)
            .select()
            .where({ project, user_id: userId })
            .first();
        stop();
        return rowToFavorite(favorite);
    }

    async getAll(): Promise<IFavoriteProject[]> {
        const stop = this.timer('getAll');
        const groups = await this.db<IFavoriteProjectRow>(
            T.FAVORITE_PROJECTS,
        ).select();
        stop();
        return groups.map(rowToFavorite);
    }
}
