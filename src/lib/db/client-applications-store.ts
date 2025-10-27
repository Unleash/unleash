import type EventEmitter from 'events';
import NotFoundError from '../error/notfound-error.js';
import type {
    IClientApplication,
    IClientApplications,
    IClientApplicationsSearchParams,
    IClientApplicationsStore,
} from '../types/stores/client-applications-store.js';
import type { Logger, LogProvider } from '../logger.js';
import type { Db } from './db.js';
import type { IApplicationOverview } from '../features/metrics/instance/models.js';
import { applySearchFilters } from '../features/feature-search/search-utils.js';
import type { IFlagResolver } from '../types/index.js';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';

const COLUMNS = [
    'app_name',
    'created_at',
    'created_by',
    'updated_at',
    'description',
    'strategies',
    'url',
    'color',
    'icon',
];
const TABLE = 'client_applications';

const TABLE_USAGE = 'client_applications_usage';

const DEPRECATED_STRATEGIES = [
    'gradualRolloutRandom',
    'gradualRolloutSessionId',
    'gradualRolloutUserId',
];

const mapRow: (any) => IClientApplication = (row) => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    strategies: row.strategies || [],
    createdBy: row.created_by,
    url: row.url,
    color: row.color,
    icon: row.icon,
    lastSeen: row.last_seen,
    announced: row.announced,
    project: row.project,
    environment: row.environment,
});

const reduceRows = (rows: any[]): IClientApplication[] => {
    const appsObj = rows.reduce((acc, row) => {
        // extracting project and environment from usage table
        const { project, environment } = row;
        const existingApp = acc[row.app_name];

        if (existingApp) {
            const existingProject = existingApp.usage.find(
                (usage) => usage.project === project,
            );

            if (existingProject) {
                existingProject.environments.push(environment);
            } else {
                existingApp.usage.push({
                    project: project,
                    environments: [environment],
                });
            }
        } else {
            acc[row.app_name] = {
                ...mapRow(row),
                usage:
                    project && environment
                        ? [
                              {
                                  project,
                                  environments: [environment],
                              },
                          ]
                        : [],
            };
        }

        return acc;
    }, {});

    return Object.values(appsObj);
};

const remapRow = (input: Partial<IClientApplication>) => {
    const temp = {
        app_name: input.appName,
        updated_at: input.updatedAt || new Date(),
        seen_at: input.lastSeen || new Date(),
        description: input.description,
        created_by: input.createdBy,
        announced: input.announced,
        url: input.url,
        color: input.color,
        icon: input.icon,
        strategies: JSON.stringify(input.strategies),
    };
    Object.keys(temp).forEach((k) => {
        if (temp[k] === undefined) {
            // not using !temp[k] to allow false and null values to get through
            delete temp[k];
        }
    });
    return temp;
};

export default class ClientApplicationsStore
    implements IClientApplicationsStore
{
    private db: Db;

    private logger: Logger;

    private timer: Function;

    private flagResolver: IFlagResolver;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.flagResolver = flagResolver;
        this.logger = getLogger('client-applications-store.ts');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'client-applications',
                action,
            });
    }

    async upsert(details: Partial<IClientApplication>): Promise<void> {
        const stopTimer = this.timer('upsert');
        const row = remapRow(details);
        await this.db(TABLE).insert(row).onConflict('app_name').merge();
        const usageRows = this.remapUsageRow(details);
        await this.db(TABLE_USAGE)
            .insert(usageRows)
            .onConflict(['app_name', 'project', 'environment'])
            .merge();
        stopTimer();
    }

    async bulkUpsert(apps: Partial<IClientApplication>[]): Promise<void> {
        const stopTimer = this.timer('bulkUpsert');
        const rows = apps.map(remapRow);
        const uniqueRows = Object.values(
            rows.reduce((acc, row) => {
                if (row.app_name) {
                    acc[row.app_name] = row;
                }
                return acc;
            }, {}),
        );
        const usageRows = apps.flatMap(this.remapUsageRow);
        const uniqueUsageRows = Object.values(
            usageRows.reduce((acc, row) => {
                if (row.app_name) {
                    acc[`${row.app_name} ${row.project} ${row.environment}`] =
                        row;
                }
                return acc;
            }, {}),
        );

        await this.db(TABLE)
            .insert(uniqueRows)
            .onConflict('app_name')
            .merge({
                updated_at: this.db.raw('EXCLUDED.updated_at'),
                seen_at: this.db.raw('EXCLUDED.seen_at'),
            });

        await this.db(TABLE_USAGE)
            .insert(uniqueUsageRows)
            .onConflict(['app_name', 'project', 'environment'])
            .ignore();
        stopTimer();
    }

    async exists(appName: string): Promise<boolean> {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE app_name = ?) AS present`,
            [appName],
        );
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }

    async getAll(): Promise<IClientApplication[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc');
        stopTimer();
        return rows.map(mapRow);
    }

    async getApplication(appName: string): Promise<IClientApplication> {
        const stopTimer = this.timer('getApplication');
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();
        stopTimer();
        if (!row) {
            throw new NotFoundError(`Could not find appName=${appName}`);
        }

        return mapRow(row);
    }

    async deleteApplication(appName: string): Promise<void> {
        return this.db(TABLE).where('app_name', appName).del();
    }

    async getApplications(
        params: IClientApplicationsSearchParams,
    ): Promise<IClientApplications> {
        const stopTimer = this.timer('getApplications');
        const { limit, offset, sortOrder = 'asc', searchParams } = params;
        const validatedSortOrder =
            sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';

        const query = this.db
            .with('applications', (qb) => {
                applySearchFilters(qb, searchParams, [
                    'client_applications.app_name',
                ]);
                qb.select([
                    ...COLUMNS.map((column) => `${TABLE}.${column}`),
                    'project',
                    'environment',
                    this.db.raw(
                        `DENSE_RANK() OVER (ORDER BY client_applications.app_name ${validatedSortOrder}) AS rank`,
                    ),
                ])
                    .from(TABLE)
                    .leftJoin(
                        TABLE_USAGE,
                        `${TABLE_USAGE}.app_name`,
                        `${TABLE}.app_name`,
                    );
            })
            .with(
                'final_ranks',
                this.db.raw(
                    'select row_number() over (order by min(rank)) as final_rank from applications group by app_name',
                ),
            )
            .with(
                'total',
                this.db.raw('select count(*) as total from final_ranks'),
            )
            .select('*')
            .from('applications')
            .joinRaw('CROSS JOIN total')
            .whereBetween('rank', [offset + 1, offset + limit]);

        const rows = await query;
        stopTimer();

        if (rows.length !== 0) {
            const applications = reduceRows(rows);
            return {
                applications,
                total: Number(rows[0].total) || 0,
            };
        }

        return {
            applications: [],
            total: 0,
        };
    }

    async getUnannounced(): Promise<IClientApplication[]> {
        const stopTimer = this.timer('getUnannounced');
        const rows = await this.db(TABLE)
            .select(COLUMNS)
            .where('announced', false);
        stopTimer();
        return rows.map(mapRow);
    }

    /** *
     * Updates all rows that have announced = false to announced =true and returns the rows altered
     * @return {[app]} - Apps that hadn't been announced
     */
    async setUnannouncedToAnnounced(): Promise<IClientApplication[]> {
        const stopTimer = this.timer('setUnannouncedToAnnounced');
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .whereNotNull('announced')
            .returning(COLUMNS);
        stopTimer();
        return rows.map(mapRow);
    }

    async delete(key: string): Promise<void> {
        const stopTimer = this.timer('delete');
        await this.db(TABLE).where('app_name', key).del();
        stopTimer();
    }

    async deleteAll(): Promise<void> {
        const stopTimer = this.timer('deleteAll');
        await this.db(TABLE).del();
        stopTimer();
    }

    destroy(): void {}

    async get(appName: string): Promise<IClientApplication> {
        const stopTimer = this.timer('get');
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();
        stopTimer();
        if (!row) {
            throw new NotFoundError(`Could not find appName=${appName}`);
        }

        return mapRow(row);
    }

    async getApplicationOverview(
        appName: string,
    ): Promise<IApplicationOverview> {
        const stopTimer = this.timer('getApplicationOverview');
        const query = this.db
            .with('metrics', (qb) => {
                qb.select([
                    'cme.app_name',
                    'cme.environment',
                    'f.project',
                    this.db.raw(
                        'array_agg(DISTINCT cme.feature_name) as features',
                    ),
                ])
                    .from('client_metrics_env as cme')
                    .where('cme.app_name', appName)
                    .leftJoin('features as f', 'f.name', 'cme.feature_name')
                    .groupBy('cme.app_name', 'cme.environment', 'f.project');
            })
            .with('instances', (qb) => {
                qb.select([
                    'ci.app_name',
                    'ci.environment',
                    this.db.raw(
                        'COUNT(DISTINCT ci.instance_id) as unique_instance_count',
                    ),
                    this.db.raw(
                        'ARRAY_AGG(DISTINCT ci.sdk_version) FILTER (WHERE ci.sdk_version IS NOT NULL) as sdk_versions',
                    ),
                    this.db.raw('MAX(ci.last_seen) as latest_last_seen'),
                    this.db.raw(
                        "ARRAY_AGG(DISTINCT ci.sdk_version) FILTER (WHERE ci.sdk_type = 'frontend' AND ci.sdk_version IS NOT NULL) as frontend_sdks",
                    ),
                    this.db.raw(
                        "ARRAY_AGG(DISTINCT ci.sdk_version) FILTER (WHERE ci.sdk_type = 'backend' AND ci.sdk_version IS NOT NULL) as backend_sdks",
                    ),
                ])
                    .from('client_instances as ci')
                    .where('ci.app_name', appName)
                    .whereRaw("ci.last_seen >= NOW() - INTERVAL '24 hours'")
                    .groupBy('ci.app_name', 'ci.environment');
            })
            .select([
                'm.project',
                'm.environment',
                'm.features',
                'i.unique_instance_count',
                'i.sdk_versions',
                'i.backend_sdks',
                'i.frontend_sdks',
                'i.latest_last_seen',
                'ca.strategies',
            ])
            .from('client_applications as ca')
            .leftJoin('metrics as m', 'm.app_name', 'ca.app_name')
            .leftJoin('instances as i', 'i.environment', 'm.environment')
            .orderBy('m.environment', 'asc');
        const rows = await query;
        stopTimer();
        if (!rows.length) {
            throw new NotFoundError(`Could not find appName=${appName}`);
        }
        const existingStrategies: string[] = await this.db
            .select('name')
            .from('strategies')
            .pluck('name');
        return this.mapApplicationOverviewData(rows, existingStrategies);
    }

    mapApplicationOverviewData(
        rows: any[],
        existingStrategies: string[],
    ): IApplicationOverview {
        const featureCount = new Set(rows.flatMap((row) => row.features)).size;
        const missingStrategies: Set<string> = new Set();

        const environments = rows.reduce((acc, row) => {
            const {
                environment,
                unique_instance_count,
                sdk_versions,
                frontend_sdks,
                backend_sdks,
                latest_last_seen,
                project,
                features,
                strategies,
            } = row;

            if (!environment) return acc;

            strategies?.forEach((strategy) => {
                if (
                    !DEPRECATED_STRATEGIES.includes(strategy) &&
                    !existingStrategies.includes(strategy)
                ) {
                    missingStrategies.add(strategy);
                }
            });

            const featuresNotMappedToProject = !project;

            let env = acc.find((e) => e.name === environment);
            if (!env) {
                env = {
                    name: environment,
                    instanceCount: Number(unique_instance_count),
                    sdks: sdk_versions || [],
                    frontendSdks: frontend_sdks || [],
                    backendSdks: backend_sdks || [],
                    lastSeen: latest_last_seen,
                    issues: {
                        missingFeatures: featuresNotMappedToProject
                            ? features
                            : [],
                    },
                };
                acc.push(env);
            } else {
                if (featuresNotMappedToProject) {
                    env.issues.missingFeatures = features;
                }
            }

            return acc;
        }, []);
        environments.forEach((env) => {
            env.sdks.sort();
        });

        return {
            projects: [
                ...new Set(
                    rows
                        .filter((row) => row.project != null)
                        .map((row) => row.project),
                ),
            ],
            featureCount,
            environments,
            issues: {
                missingStrategies: [...missingStrategies],
            },
        };
    }

    private remapUsageRow = (input: Partial<IClientApplication>) => {
        if (!input.projects || input.projects.length === 0) {
            return [
                {
                    app_name: input.appName,
                    project: '*',
                    environment: input.environment || '*',
                },
            ];
        } else {
            return input.projects.map((project) => ({
                app_name: input.appName,
                project: project,
                environment: input.environment || '*',
            }));
        }
    };

    async removeInactiveApplications(): Promise<number> {
        const stopTimer = this.timer('removeInactiveApplications');
        const rows = await this.db(TABLE)
            .whereRaw("seen_at < now() - interval '30 days'")
            .del();
        stopTimer();
        if (rows > 0) {
            this.logger.debug(`Deleted ${rows} applications`);
        }

        return rows;
    }
}
