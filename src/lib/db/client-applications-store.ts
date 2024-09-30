import type EventEmitter from 'events';
import NotFoundError from '../error/notfound-error';
import type {
    IClientApplication,
    IClientApplications,
    IClientApplicationsSearchParams,
    IClientApplicationsStore,
} from '../types/stores/client-applications-store';
import type { Logger, LogProvider } from '../logger';
import type { Db } from './db';
import type { IApplicationOverview } from '../features/metrics/instance/models';
import { applySearchFilters } from '../features/feature-search/search-utils';
import type { IFlagResolver } from '../types';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';

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

const remapRow = (input) => {
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
        const row = remapRow(details);
        await this.db(TABLE).insert(row).onConflict('app_name').merge();
        const usageRows = this.remapUsageRow(details);
        await this.db(TABLE_USAGE)
            .insert(usageRows)
            .onConflict(['app_name', 'project', 'environment'])
            .merge();
    }

    async bulkUpsert(apps: Partial<IClientApplication>[]): Promise<void> {
        const rows = apps.map(remapRow);
        const usageRows = apps.flatMap(this.remapUsageRow);
        await this.db(TABLE).insert(rows).onConflict('app_name').merge();
        await this.db(TABLE_USAGE)
            .insert(usageRows)
            .onConflict(['app_name', 'project', 'environment'])
            .merge();
    }

    async exists(appName: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE app_name = ?) AS present`,
            [appName],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getAll(): Promise<IClientApplication[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc');

        return rows.map(mapRow);
    }

    async getApplication(appName: string): Promise<IClientApplication> {
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();

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
        const rows = await this.db(TABLE)
            .select(COLUMNS)
            .where('announced', false);
        return rows.map(mapRow);
    }

    /** *
     * Updates all rows that have announced = false to announced =true and returns the rows altered
     * @return {[app]} - Apps that hadn't been announced
     */
    async setUnannouncedToAnnounced(): Promise<IClientApplication[]> {
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .whereNotNull('announced')
            .returning(COLUMNS);
        return rows.map(mapRow);
    }

    async delete(key: string): Promise<void> {
        await this.db(TABLE).where('app_name', key).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async get(appName: string): Promise<IClientApplication> {
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();

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
                    .leftJoin('features as f', 'f.name', 'cme.feature_name')
                    .groupBy('cme.app_name', 'cme.environment', 'f.project');
            })
            .select([
                'm.project',
                'm.environment',
                'm.features',
                'ci.instance_id',
                'ci.sdk_version',
                'ci.last_seen',
                'a.strategies',
            ])
            .from({ a: 'client_applications' })
            .leftJoin('metrics as m', 'm.app_name', 'a.app_name')
            .leftJoin('client_instances as ci', function () {
                this.on('ci.app_name', '=', 'm.app_name').andOn(
                    'ci.environment',
                    '=',
                    'm.environment',
                );
            })
            .where('a.app_name', appName)
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
                instance_id,
                sdk_version,
                last_seen,
                project,
                features,
                strategies,
            } = row;

            if (!environment) return acc;

            strategies.forEach((strategy) => {
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
                    instanceCount: instance_id ? 1 : 0,
                    sdks: sdk_version ? [sdk_version] : [],
                    lastSeen: last_seen,
                    uniqueInstanceIds: new Set(
                        instance_id ? [instance_id] : [],
                    ),
                    issues: {
                        missingFeatures: featuresNotMappedToProject
                            ? features
                            : [],
                    },
                };
                acc.push(env);
            } else {
                if (instance_id) {
                    env.uniqueInstanceIds.add(instance_id);
                    env.instanceCount = env.uniqueInstanceIds.size;
                }
                if (featuresNotMappedToProject) {
                    env.issues.missingFeatures = features;
                }
                if (sdk_version && !env.sdks.includes(sdk_version)) {
                    env.sdks.push(sdk_version);
                }
                if (new Date(last_seen) > new Date(env.lastSeen)) {
                    env.lastSeen = last_seen;
                }
            }

            return acc;
        }, []);
        environments.forEach((env) => {
            delete env.uniqueInstanceIds;
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

    private remapUsageRow = (input) => {
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
}
