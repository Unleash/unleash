import { Knex } from 'knex';
import EventEmitter from 'events';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import NotFoundError from '../error/notfound-error';
import { Logger, LogProvider } from '../logger';
import { FeatureToggleDTO, FeatureToggle, IVariant } from '../types/model';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';

const FEATURE_COLUMNS = [
    'name',
    'description',
    'type',
    'project',
    'stale',
    'variants',
    'created_at',
    'last_seen_at',
];

export interface FeaturesTable {
    name: string;
    description: string;
    type: string;
    stale: boolean;
    variants: string;
    project: string;
    last_seen_at?: Date;
    created_at?: Date;
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
        return this.db
            .count('*')
            .from(TABLE)
            .where(query)
            .then((res) => Number(res[0].count));
    }

    async getFeatureMetadata(name: string): Promise<FeatureToggle> {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name, archived: 0 })
            .then(this.rowToFeature);
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async get(name: string): Promise<FeatureToggle> {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name, archived: 0 })
            .then(this.rowToFeature);
    }

    async getAll(): Promise<FeatureToggle[]> {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: false });
        return rows.map(this.rowToFeature);
    }

    async getFeatures(archived: boolean): Promise<FeatureToggle[]> {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived });
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

    /**
     * TODO: Should really be a Promise<boolean> rather than returning a { featureName, archived } object
     * @param name
     */
    async hasFeature(name: string): Promise<any> {
        return this.db
            .first('name', 'archived')
            .from(TABLE)
            .where({ name })
            .then((row) => {
                if (!row) {
                    throw new NotFoundError('No feature toggle found');
                }
                return {
                    name: row.name,
                    archived: row.archived,
                };
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

    async getArchivedFeatures(): Promise<FeatureToggle[]> {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: 1 })
            .orderBy('name', 'asc');
        return rows.map(this.rowToFeature);
    }

    async updateLastSeenForToggles(toggleNames: string[]): Promise<void> {
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

    rowToFeature(row: FeaturesTable): FeatureToggle {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        return {
            name: row.name,
            description: row.description,
            type: row.type,
            project: row.project,
            stale: row.stale,
            variants: row.variants as unknown as IVariant[],
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
        };
    }

    dtoToRow(project: string, data: FeatureToggleDTO): FeaturesTable {
        const row = {
            name: data.name,
            description: data.description,
            type: data.type,
            project,
            archived: data.archived || false,
            stale: data.stale,
            variants: data.variants ? JSON.stringify(data.variants) : null,
            created_at: data.createdAt,
        };
        if (!row.created_at) {
            delete row.created_at;
        }
        return row;
    }

    async createFeature(
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

    async updateFeature(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .where({ name: data.name })
            .update(this.dtoToRow(project, data))
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }

    async archiveFeature(name: string): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .where({ name })
            .update({ archived: true })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }

    async delete(name: string): Promise<void> {
        await this.db(TABLE)
            .where({ name, archived: true }) // Feature toggle must be archived to allow deletion
            .del();
    }

    async reviveFeature(name: string): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .where({ name })
            .update({ archived: false })
            .returning(FEATURE_COLUMNS);
        return this.rowToFeature(row[0]);
    }

    async getFeaturesBy(params: {
        archived?: boolean;
        project?: string;
        stale?: boolean;
    }): Promise<FeatureToggle[]> {
        const rows = await this.db(TABLE).where(params);
        return rows.map(this.rowToFeature);
    }

    async getFeaturesByInternal(params: {
        archived?: boolean;
        project?: string;
        stale?: boolean;
    }): Promise<FeatureToggle[]> {
        return this.db(TABLE).where(params);
    }
}

module.exports = FeatureToggleStore;
