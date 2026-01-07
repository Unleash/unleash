import type { Knex } from 'knex';
import type EventEmitter from 'events';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import NotFoundError from '../../error/notfound-error.js';
import type { Logger, LogProvider } from '../../logger.js';
import type {
    FeatureToggle,
    FeatureToggleDTO,
    IFeatureToggleQuery,
    IVariant,
} from '../../types/model.js';
import type { IFeatureToggleStore } from './types/feature-toggle-store-type.js';
import type { Db } from '../../db/db.js';
import type { LastSeenInput } from '../metrics/last-seen/last-seen-service.js';
import { NameExistsError } from '../../error/index.js';
import { DEFAULT_ENV } from '../../util/index.js';

import { FeatureToggleListBuilder } from './query-builders/feature-toggle-list-builder.js';
import type { FeatureConfigurationClient } from './types/feature-toggle-strategies-store-type.js';
import {
    ADMIN_TOKEN_USER,
    type IFeatureTypeCount,
    type IFlagResolver,
} from '../../types/index.js';
import { FeatureToggleRowConverter } from './converters/feature-toggle-row-converter.js';
import type { IFeatureProjectUserParams } from './feature-toggle-controller.js';

export type EnvironmentFeatureNames = {
    [key: string]: string[];
};

const FEATURE_COLUMNS = [
    'name',
    'description',
    'type',
    'project',
    'stale',
    'created_at',
    'impression_data',
    'last_seen_at',
    'archived_at',
];

export interface FeaturesTable {
    name: string;
    description: string | null;
    type?: string;
    stale?: boolean | null;
    project: string;
    last_seen_at?: Date;
    created_at?: Date;
    impression_data?: boolean | null;
    archived?: boolean;
    archived_at?: Date | null;
    created_by_user_id?: number;
}

export interface FeatureToggleInsert
    extends Omit<FeatureToggleDTO, 'createdByUserId'> {
    createdByUserId: number;
}

interface VariantDTO {
    variants: IVariant[];
}

const commonSelectColumns = [
    'features.name as name',
    'features.description as description',
    'features.type as type',
    'features.project as project',
    'features.stale as stale',
    'features.impression_data as impression_data',
    'features.last_seen_at as last_seen_at',
    'features.created_at as created_at',
];

const TABLE = 'features';
const FEATURE_ENVIRONMENTS_TABLE = 'feature_environments';

export default class FeatureToggleStore implements IFeatureToggleStore {
    private db: Db;

    private logger: Logger;

    private timer: Function;

    private featureToggleRowConverter: FeatureToggleRowConverter;

    private flagResolver: IFlagResolver;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.ts');
        this.featureToggleRowConverter = new FeatureToggleRowConverter(
            flagResolver,
        );
        this.flagResolver = flagResolver;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    async count(
        query: { archived?: boolean; project?: string; stale?: boolean } = {
            archived: false,
        },
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

    private getBaseFeatureQuery = (archived: boolean, environment: string) => {
        const builder = new FeatureToggleListBuilder(this.db, [
            ...commonSelectColumns,
            'fe.variants as variants',
            'fe.enabled as enabled',
            'fe.environment as environment',
            'fs.id as strategy_id',
            'fs.strategy_name as strategy_name',
            'fs.title as strategy_title',
            'fs.disabled as strategy_disabled',
            'fs.parameters as parameters',
            'fs.constraints as constraints',
            'fs.sort_order as sort_order',
            'fs.milestone_id as milestone_id',
            'fs.variants as strategy_variants',
            'segments.id as segment_id',
            'segments.constraints as segment_constraints',
        ]);

        builder
            .query('features')
            .withArchived(archived)
            .withStrategies(environment)
            .withFeatureEnvironments(environment)
            .withFeatureStrategySegments()
            .withSegments();

        return builder;
    };

    async getFeatureToggleList(
        featureQuery?: IFeatureToggleQuery,
        userId?: number,
        archived: boolean = false,
        includeDisabledStrategies: boolean = false,
    ): Promise<FeatureToggle[]> {
        const environment = featureQuery?.environment || DEFAULT_ENV;

        const builder = this.getBaseFeatureQuery(
            archived,
            environment,
        ).withFeatureTags();

        builder.addSelectColumn('ft.tag_value as tag_value');
        builder.addSelectColumn('ft.tag_type as tag_type');

        builder.withLastSeenByEnvironment(archived);
        builder.addSelectColumn(
            'last_seen_at_metrics.last_seen_at as env_last_seen_at',
        );
        builder.addSelectColumn(
            'last_seen_at_metrics.environment as last_seen_at_env',
        );

        if (userId) {
            builder.withFavorites(userId);
            builder.addSelectColumn(
                this.db.raw(
                    'favorite_features.feature is not null as favorite',
                ),
            );
        }

        const rows = await builder.internalQuery.select(
            builder.getSelectColumns(),
        );

        return this.featureToggleRowConverter.buildFeatureToggleListFromRows(
            rows,
            featureQuery,
            includeDisabledStrategies,
        );
    }

    async getPlaygroundFeatures(
        featureQuery: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const environment = featureQuery?.environment || DEFAULT_ENV;

        const archived = false;
        const builder = this.getBaseFeatureQuery(archived, environment);

        builder.withDependentFeatureToggles();

        builder.addSelectColumn('df.parent as parent');
        builder.addSelectColumn('df.variants as parent_variants');
        builder.addSelectColumn('df.enabled as parent_enabled');

        if (featureQuery?.project) {
            builder.forProject(featureQuery.project);
        }

        const rows = await builder.internalQuery.select(
            builder.getSelectColumns(),
        );

        return this.featureToggleRowConverter.buildPlaygroundFeaturesFromRows(
            rows,
            featureQuery,
        );
    }

    async getAll(
        query: { archived?: boolean; project?: string; stale?: boolean } = {
            archived: false,
        },
    ): Promise<FeatureToggle[]> {
        const { archived, ...rest } = query;
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where(rest)
            .modify(FeatureToggleStore.filterByArchived, archived);

        return rows.map(this.rowToFeature);
    }

    async getFeatureTypeCounts({
        projectId,
        archived,
    }: IFeatureProjectUserParams): Promise<IFeatureTypeCount[]> {
        const query = this.db<FeaturesTable>(TABLE)
            .select('type')
            .count('type')
            .groupBy('type');

        query
            .where({
                project: projectId,
            })
            .modify(FeatureToggleStore.filterByArchived, archived);

        const result = await query;
        return result.map((row) => ({
            type: row.type!,
            count: Number(row.count),
        }));
    }

    async getAllByNames(names: string[]): Promise<FeatureToggle[]> {
        const query = this.db<FeaturesTable>(TABLE).orderBy('name', 'asc');
        query.whereIn('name', names);

        const rows = await query;
        return rows.map(this.rowToFeature);
    }

    async countByDate(queryModifiers: {
        archived?: boolean;
        project?: string;
        date?: string;
        range?: string[];
        dateAccessor: string;
    }): Promise<number> {
        const { project, archived, dateAccessor } = queryModifiers;
        const query = this.db
            .count()
            .from(TABLE)
            .where({ project })
            .modify(FeatureToggleStore.filterByArchived, archived);

        if (queryModifiers.date) {
            query.andWhere(dateAccessor, '>=', queryModifiers.date);
        }

        if (queryModifiers.range && queryModifiers.range.length === 2) {
            query.andWhereBetween(dateAccessor, [
                queryModifiers.range[0],
                queryModifiers.range[1],
            ]);
        }

        const queryResult = await query.first();
        return Number.parseInt(queryResult.count || 0, 10);
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

    async setLastSeen(data: LastSeenInput[]): Promise<void> {
        const now = new Date();
        const environmentArrays = this.mapMetricDataToEnvBuckets(data);
        try {
            for (const env of Object.keys(environmentArrays)) {
                const toggleNames = environmentArrays[env].sort();
                await this.db(FEATURE_ENVIRONMENTS_TABLE)
                    .update({ last_seen_at: now })
                    .where('environment', env)
                    .whereIn(
                        'feature_name',
                        this.db(FEATURE_ENVIRONMENTS_TABLE)
                            .select('feature_name')
                            .whereIn('feature_name', toggleNames)
                            .forUpdate()
                            .skipLocked(),
                    );

                // Updating the toggle's last_seen_at also for backwards compatibility
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
            }
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }

    private mapMetricDataToEnvBuckets(
        data: LastSeenInput[],
    ): EnvironmentFeatureNames {
        return data.reduce(
            (acc: EnvironmentFeatureNames, feature: LastSeenInput) => {
                const { environment, featureName } = feature;

                if (!acc[environment]) {
                    acc[environment] = [];
                }

                acc[environment].push(featureName);

                return acc;
            },
            {},
        );
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
            throw new NotFoundError('No feature flag found');
        }
        return {
            name: row.name,
            description: row.description,
            type: row.type,
            project: row.project,
            stale: row.stale || false,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
            impressionData: row.impression_data || false,
            archivedAt: row.archived_at || undefined,
            archived: row.archived_at != null,
        };
    }

    rowToEnvVariants(variantRows: VariantDTO[]): IVariant[] {
        if (!variantRows.length) {
            return [];
        }

        const sortedVariants =
            (variantRows[0].variants as unknown as IVariant[]) || [];
        sortedVariants.sort((a, b) => a.name.localeCompare(b.name));
        return sortedVariants;
    }

    insertToRow(project: string, data: FeatureToggleInsert): FeaturesTable {
        const row = {
            name: data.name,
            description: data.description || null,
            type: data.type,
            project,
            archived_at: data.archived ? new Date() : null,
            stale: data.stale || false,
            created_at: data.createdAt,
            impression_data: data.impressionData || false,
            created_by_user_id: data.createdByUserId,
        };
        if (!row.created_at) {
            delete row.created_at;
        }

        return row;
    }

    dtoToUpdateRow(
        project: string,
        data: FeatureToggleDTO,
    ): Omit<FeaturesTable, 'created_by_user_id'> {
        const row = {
            name: data.name,
            description: data.description || null,
            type: data.type,
            project,
            archived_at: data.archived ? new Date() : null,
            stale: data.stale,
            impression_data: data.impressionData,
        };

        return row;
    }

    async create(
        project: string,
        data: FeatureToggleInsert,
    ): Promise<FeatureToggle> {
        try {
            const row = await this.db(TABLE)
                .insert(this.insertToRow(project, data))
                .returning(FEATURE_COLUMNS);

            return this.rowToFeature(row[0]);
        } catch (err) {
            this.logger.error('Could not insert feature, error: ', err);
            if (
                typeof err.detail === 'string' &&
                err.detail.includes('already exists')
            ) {
                throw new NameExistsError(
                    `Feature ${data.name} already exists`,
                );
            }
            throw err;
        }
    }

    async update(
        project: string,
        data: FeatureToggleDTO,
    ): Promise<FeatureToggle> {
        const row = await this.db(TABLE)
            .where({ name: data.name })
            .update(this.dtoToUpdateRow(project, data))
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

    async batchArchive(names: string[]): Promise<FeatureToggle[]> {
        const now = new Date();
        const rows = await this.db(TABLE)
            .whereIn('name', names)
            .update({ archived_at: now })
            .returning(FEATURE_COLUMNS);
        return rows.map((row) => this.rowToFeature(row));
    }

    async batchStale(
        names: string[],
        stale: boolean,
    ): Promise<FeatureToggle[]> {
        const rows = await this.db(TABLE)
            .whereIn('name', names)
            .update({ stale })
            .returning(FEATURE_COLUMNS);
        return rows.map((row) => this.rowToFeature(row));
    }

    async delete(name: string): Promise<void> {
        await this.db(TABLE)
            .where({ name }) // Feature flag must be archived to allow deletion
            .whereNotNull('archived_at')
            .del();
    }

    async batchDelete(names: string[]): Promise<void> {
        await this.db(TABLE)
            .whereIn('name', names)
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

    async batchRevive(names: string[]): Promise<FeatureToggle[]> {
        const rows = await this.db(TABLE)
            .whereIn('name', names)
            .update({ archived_at: null })
            .returning(FEATURE_COLUMNS);

        return rows.map((row) => this.rowToFeature(row));
    }

    async disableAllEnvironmentsForFeatures(names: string[]): Promise<void> {
        await this.db(FEATURE_ENVIRONMENTS_TABLE)
            .whereIn('feature_name', names)
            .update({ enabled: false });
    }

    async getVariants(featureName: string): Promise<IVariant[]> {
        if (!(await this.exists(featureName))) {
            throw new NotFoundError('No feature flag found');
        }
        const row = await this.db(`${TABLE} as f`)
            .select('fe.variants')
            .join(
                `${FEATURE_ENVIRONMENTS_TABLE} as fe`,
                'fe.feature_name',
                'f.name',
            )
            .where({ name: featureName })
            .limit(1);

        return this.rowToEnvVariants(row);
    }

    async getVariantsForEnv(
        featureName: string,
        environment: string,
    ): Promise<IVariant[]> {
        const row = await this.db(`${TABLE} as f`)
            .select('fev.variants')
            .join(
                `${FEATURE_ENVIRONMENTS_TABLE} as fev`,
                'fev.feature_name',
                'f.name',
            )
            .where({ name: featureName })
            .andWhere({ environment });

        return this.rowToEnvVariants(row);
    }

    async saveVariants(
        project: string,
        featureName: string,
        newVariants: IVariant[],
    ): Promise<FeatureToggle> {
        const variantsString = JSON.stringify(newVariants);
        await this.db('feature_environments')
            .update('variants', variantsString)
            .where('feature_name', featureName);

        const row = await this.db(TABLE).select(FEATURE_COLUMNS).where({
            project: project,
            name: featureName,
        });

        const flag = this.rowToFeature(row[0]);
        flag.variants = newVariants;

        return flag;
    }

    async updatePotentiallyStaleFeatures(currentTime?: string): Promise<
        {
            name: string;
            potentiallyStale: boolean;
            project: string;
        }[]
    > {
        const query = this.db.raw(
            `SELECT name,
                    project,
                    potentially_stale,
                    (? > (features.created_at + ((SELECT feature_types.lifetime_days
                                                  FROM feature_types
                                                  WHERE feature_types.id = features.type) *
                                                 INTERVAL '1 day'))) as current_staleness
             FROM features
             WHERE NOT stale = true
               AND archived_at IS NULL`,
            [currentTime || this.db.fn.now()],
        );

        const featuresToUpdate = (await query).rows
            .filter(
                ({ potentially_stale, current_staleness }) =>
                    (potentially_stale ?? false) !==
                    (current_staleness ?? false),
            )
            .map(({ current_staleness, name, project }) => ({
                potentiallyStale: current_staleness ?? false,
                name,
                project,
            }));

        await this.db(TABLE)
            .update('potentially_stale', true)
            .whereIn(
                'name',
                featuresToUpdate
                    .filter((feature) => feature.potentiallyStale === true)
                    .map((feature) => feature.name),
            );

        await this.db(TABLE)
            .update('potentially_stale', false)
            .whereIn(
                'name',
                featuresToUpdate
                    .filter((feature) => feature.potentiallyStale !== true)
                    .map((feature) => feature.name),
            );

        return featuresToUpdate;
    }

    async isPotentiallyStale(featureName: string): Promise<boolean> {
        const result = await this.db(TABLE)
            .first(['potentially_stale'])
            .from(TABLE)
            .where({ name: featureName });

        return result?.potentially_stale ?? false;
    }

    async setCreatedByUserId(batchSize: number): Promise<number | undefined> {
        const EVENTS_TABLE = 'events';
        const USERS_TABLE = 'users';
        const API_TOKEN_TABLE = 'api_tokens';

        const toUpdate = await this.db(`${TABLE} as f`)
            .joinRaw(`JOIN ${EVENTS_TABLE} AS ev ON ev.feature_name = f.name`)
            .joinRaw(
                `LEFT OUTER JOIN ${USERS_TABLE} AS u on ev.created_by = u.username OR ev.created_by = u.email`,
            )
            .joinRaw(
                `LEFT OUTER JOIN ${API_TOKEN_TABLE} AS t on ev.created_by = t.username`,
            )
            .whereRaw(
                `f.created_by_user_id IS null AND
                ev.type = 'feature-created' AND
                (u.id IS NOT null OR t.username IS NOT null)`,
            )
            .orderBy('f.created_at', 'desc')
            .limit(batchSize)
            .select(['f.*', 'ev.created_by', 'u.id', 't.username']);

        const updatePromises = toUpdate.map((row) => {
            const id = row.id || ADMIN_TOKEN_USER.id;

            return this.db(TABLE)
                .update({ created_by_user_id: id })
                .where({ name: row.name });
        });

        await Promise.all(updatePromises);
        return toUpdate.length;
    }
}
