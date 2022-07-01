import { Knex } from 'knex';
import EventEmitter from 'events';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import NotFoundError from '../error/notfound-error';
import { Logger, LogProvider } from '../logger';
import { FeatureToggle, FeatureToggleDTO, IVariant } from '../types/model';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';

const FEATURE_COLUMNS = [
    'name',
    'description',
    'type',
    'project',
    'stale',
    'variants',
    'created_at',
    'impression_data',
    'last_seen_at',
    'archived_at',
];

export interface FeaturesTable {
    name: string;
    description: string;
    type: string;
    stale: boolean;
    variants?: string;
    project: string;
    last_seen_at?: Date;
    created_at?: Date;
    impression_data: boolean;
    archived?: boolean;
    archived_at?: Date;
}

const TABLE = 'features';

export default class FeatureToggleStore implements IFeatureToggleStore {
    private db: Knex;

    private logger: Logger;

    private timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    async count(
        query: {
            archived?: boolean;
            project?: string;
            stale?: boolean;
        } = { archived: false },
    ): Promise<number> {
        const { archived, ...rest } = query;
        return this.db
            .from(TABLE)
            .count('*')
            .where(rest)
            .modify(FeatureToggleStore.filterByArchived, archived)
            .then((res) => Number(res[0].count));
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async get(name: string): Promise<FeatureToggle> {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(this.rowToFeature);
    }

    async getAll(
        query: {
            archived?: boolean;
            project?: string;
            stale?: boolean;
        } = { archived: false },
    ): Promise<FeatureToggle[]> {
        const { archived, ...rest } = query;
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where(rest)
            .modify(FeatureToggleStore.filterByArchived, archived);
        return rows.map(this.rowToFeature);
    }

    /**
     * Get projectId from feature filtered by name. Used by Rbac middleware
     * @deprecated
     * @param name
     */
    async getProjectId(name: string): Promise<string> {
        return this.db
            .first(['project'])
            .from(TABLE)
            .where({ name })
            .then((r) => (r ? r.project : undefined))
            .catch((e) => {
                this.logger.error(e);
                return undefined;
            });
    }

    async exists(name: string): Promise<boolean> {
        const result = await this.db.raw(
            'SELECT EXISTS (SELECT 1 FROM features WHERE name = ?) AS present',
            [name],
        );
        const { present } = result.rows[0];
        return present;
    }

    async setLastSeen(toggleNames: string[]): Promise<void> {
        const now = new Date();
        try {
            await this.db(TABLE)
                .update({ last_seen_at: now })
                .whereIn(
                    'name',
                    this.db(TABLE)
                        .select('name')
                        .whereIn('name', toggleNames)
                        .forUpdate()
                        .skipLocked(),
                );
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }

    static filterByArchived: Knex.QueryCallbackWithArgs = (
        queryBuilder: Knex.QueryBuilder,
        archived: boolean,
    ) => {
        return archived
            ? queryBuilder.whereNotNull('archived_at')
            : queryBuilder.whereNull('archived_at');
    };

    rowToFeature(row: FeaturesTable): FeatureToggle {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        const sortedVariants = (row.variants as unknown as IVariant[]) || [];
        sortedVariants.sort((a, b) => a.name.localeCompare(b.name));
        return {
            name: row.name,
            description: row.description,
            type: row.type,
            project: row.project,
            stale: row.stale,
            variants: sortedVariants,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
            impressionData: row.impression_data,
            archivedAt: row.archived_at,
            archived: row.archived_at != null,
        };
    }

    rowToVariants(row: FeaturesTable): IVariant[] {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        const sortedVariants = (row.variants as unknown as IVariant[]) || [];
        sortedVariants.sort((a, b) => a.name.localeCompare(b.name));

        return sortedVariants;
    }

    dtoToRow(project: string, data: FeatureToggleDTO): FeaturesTable {
        const row = {
            name: data.name,
            description: data.description,
            type: data.type,
            project,
            archived_at: data.archived ? new Date() : null,
            stale: data.stale,
            created_at: data.createdAt,
            impression_data: data.impressionData,
            variants: JSON.stringify(data.variants),
        };
        if (!row.created_at) {
            delete row.created_at;
        }
        return row;
    }

    async create(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle> {
        try {
            const row = await this.db(TABLE)
                .insert(this.dtoToRow(project, data))
                .returning(FEATURE_COLUMNS);

            return this.rowToFeature(row[0]);
        } catch (err) {
            this.logger.error('Could not insert feature, error: ', err);
        }
        return undefined;
    }

    async update(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .where({ name: data.name })
            .update(this.dtoToRow(project, data))
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }

    async archive(name: string): Promise<FeatureToggle> {
        const now = new Date();
        const row = await this.db(TABLE)
            .where({ name })
            .update({ archived_at: now })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }

    async delete(name: string): Promise<void> {
        await this.db(TABLE)
            .where({ name }) // Feature toggle must be archived to allow deletion
            .whereNotNull('archived_at')
            .del();
    }

    async revive(name: string): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .where({ name })
            .update({ archived_at: null })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }

    async getVariants(featureName: string): Promise<IVariant[]> {
        const row = await this.db(TABLE)
            .select('variants')
            .where({ name: featureName });
        return this.rowToVariants(row[0]);
    }

    async saveVariants(
        project: string,
        featureName: string,
        newVariants: IVariant[],
    ): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .update({ variants: JSON.stringify(newVariants) })
            .where({ project: project, name: featureName })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }
}

module.exports = FeatureToggleStore;
