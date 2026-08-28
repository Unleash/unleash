import type EventEmitter from 'events';
import type { Db } from '../../db/db.js';
import { DB_TIME } from '../../metric-events.js';
import metricsHelper from '../../util/metrics-helper.js';
import type { ProjectAccess } from '../private-project/privateProjectStore.js';
import type {
    FlagCreator,
    FlagCreatorsSearchOptions,
    FlagCreatorsSearchResult,
    IProjectFlagCreatorsReadModel,
} from './project-flag-creators-read-model.type.js';

export class ProjectFlagCreatorsReadModel
    implements IProjectFlagCreatorsReadModel
{
    private db: Db;

    private timer: (action: string) => Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'project-flag-creators',
                action,
            });
    }

    async getFlagCreators(project: string): Promise<FlagCreator[]> {
        const result = await this.db('users')
            .distinct('users.id')
            .join('features', 'users.id', '=', 'features.created_by_user_id')
            .where('features.project', project)
            .where('features.archived_at', null)
            .select([
                'users.id',
                'users.name',
                'users.username',
                'users.email',
            ]);
        return result
            .filter((row) => row.name || row.username || row.email)
            .map((row) => ({
                id: Number(row.id),
                name: String(row.name || row.username || row.email),
            }));
    }

    async getFlagCreatorsAcrossProjects(
        accessibleProjects: ProjectAccess,
        { query, limit, offset }: FlagCreatorsSearchOptions,
    ): Promise<FlagCreatorsSearchResult> {
        const stopTimer = this.timer('getFlagCreatorsAcrossProjects');
        const buildBaseQuery = () => {
            const qb = this.db('users').whereExists((builder) => {
                builder
                    .select(this.db.raw('1'))
                    .from('features')
                    .whereRaw('features.created_by_user_id = users.id')
                    .whereNull('features.archived_at');

                if (accessibleProjects.mode === 'limited') {
                    builder.whereIn(
                        'features.project',
                        accessibleProjects.projects,
                    );
                }
            });

            if (query) {
                qb.andWhere((builder) => {
                    builder
                        .where('users.name', 'ILIKE', `%${query}%`)
                        .orWhere('users.username', 'ILIKE', `${query}%`)
                        .orWhere('users.email', 'ILIKE', `${query}%`);
                });
            }

            // Exclude users whose name, username, and email are all empty/NULL
            // so `total` and page length stay consistent. Relies on SQL NULL
            // semantics: `NULL <> ''` is NULL (treated as false in WHERE), so a
            // row is kept only when at least one field is a non-empty string.
            qb.where((builder) => {
                builder
                    .where('users.name', '<>', '')
                    .orWhere('users.username', '<>', '')
                    .orWhere('users.email', '<>', '');
            });

            return qb;
        };

        const [{ total }] =
            await buildBaseQuery().count<{ total: string }[]>('* as total');

        const rows = await buildBaseQuery()
            .select(['users.id', 'users.name', 'users.username', 'users.email'])
            .orderBy('users.name')
            .orderBy('users.id')
            .limit(limit)
            .offset(offset);

        const flagCreators = rows.map((row) => ({
            id: Number(row.id),
            name: String(row.name || row.username || row.email),
        }));

        stopTimer();
        return { flagCreators, total: Number(total) || 0 };
    }
}
