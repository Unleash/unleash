import { Knex } from 'knex';
import type { Logger, LogProvider } from '../../logger';

import NotFoundError from '../../error/notfound-error';
import type {
    IEnvironment,
    IFlagResolver,
    IProject,
    IProjectApplication,
    IProjectApplications,
    IProjectUpdate,
    IProjectWithCount,
    ProjectMode,
} from '../../types';
import type {
    IProjectHealthUpdate,
    IProjectInsert,
    IProjectQuery,
    IProjectSettings,
    IProjectEnterpriseSettingsUpdate,
    IProjectStore,
    ProjectEnvironment,
    IProjectApplicationsSearchParams,
} from '../../features/project/project-store-type';
import { DEFAULT_ENV } from '../../util';
import metricsHelper from '../../util/metrics-helper';
import { DB_TIME } from '../../metric-events';
import type EventEmitter from 'events';
import type { Db } from '../../db/db';
import Raw = Knex.Raw;
import type { CreateFeatureStrategySchema } from '../../openapi';
import { applySearchFilters } from '../feature-search/search-utils';

const COLUMNS = [
    'id',
    'name',
    'description',
    'created_at',
    'health',
    'updated_at',
];
const TABLE = 'projects';
const SETTINGS_COLUMNS = [
    'project_mode',
    'default_stickiness',
    'feature_limit',
    'feature_naming_pattern',
    'feature_naming_example',
    'feature_naming_description',
];
const SETTINGS_TABLE = 'project_settings';
const PROJECT_ENVIRONMENTS = 'project_environments';

export interface IEnvironmentProjectLink {
    environmentName: string;
    projectId: string;
}

export interface ProjectModeCount {
    mode: ProjectMode;
    count: number;
}

export interface IProjectMembersCount {
    count: number;
    project: string;
}

class ProjectStore implements IProjectStore {
    private db: Db;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    private timer: Function;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.logger = getLogger('project-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'project',
                action,
            });
        this.flagResolver = flagResolver;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    fieldToRow(data): Omit<IProjectInsert, 'mode'> {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
        };
    }

    destroy(): void {}

    async isFeatureLimitReached(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1
                           FROM project_settings
                                    LEFT JOIN features ON project_settings.project = features.project
                           WHERE project_settings.project = ?
                             AND features.archived_at IS NULL
                           GROUP BY project_settings.project
                           HAVING project_settings.feature_limit <= COUNT(features.project)) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getProjectsWithCounts(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<IProjectWithCount[]> {
        const projectTimer = this.timer('getProjectsWithCount');
        let projects = this.db(TABLE)
            .leftJoin('features', 'features.project', 'projects.id')
            .leftJoin(
                'project_settings',
                'project_settings.project',
                'projects.id',
            )
            .leftJoin('project_stats', 'project_stats.project', 'projects.id')
            .orderBy('projects.name', 'asc');

        if (this.flagResolver.isEnabled('archiveProjects')) {
            if (query?.archived === true) {
                projects = projects.whereNot(`${TABLE}.archived_at`, null);
            } else {
                projects = projects.where(`${TABLE}.archived_at`, null);
            }
        }

        if (query?.id) {
            projects = projects.where(`${TABLE}.id`, query.id);
        }

        let selectColumns = [
            this.db.raw(
                'projects.id, projects.name, projects.description, projects.health, projects.updated_at, projects.created_at, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null) AS number_of_features, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null and features.stale IS TRUE) AS stale_feature_count, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null and features.potentially_stale IS TRUE) AS potentially_stale_feature_count',
            ),
            'project_settings.default_stickiness',
            'project_settings.project_mode',
            'project_stats.avg_time_to_prod_current_window',
        ] as (string | Raw<any>)[];

        if (this.flagResolver.isEnabled('archiveProjects')) {
            selectColumns.push(`${TABLE}.archived_at`);
        }

        let groupByColumns = [
            'projects.id',
            'project_settings.default_stickiness',
            'project_settings.project_mode',
            'project_stats.avg_time_to_prod_current_window',
        ];

        if (userId) {
            projects = projects.leftJoin(`favorite_projects`, function () {
                this.on('favorite_projects.project', 'projects.id').andOnVal(
                    'favorite_projects.user_id',
                    '=',
                    userId,
                );
            });
            selectColumns = [
                ...selectColumns,
                this.db.raw(
                    'favorite_projects.project is not null as favorite',
                ),
            ];
            groupByColumns = [...groupByColumns, 'favorite_projects.project'];
        }

        const projectAndFeatureCount = await projects
            .select(selectColumns)
            .groupBy(groupByColumns);

        const projectsWithFeatureCount = projectAndFeatureCount.map(
            this.mapProjectWithCountRow,
        );
        projectTimer();
        const memberTimer = this.timer('getMemberCount');

        const memberCount = await this.getMembersCount();
        memberTimer();
        const memberMap = new Map<string, number>(
            memberCount.map((c) => [c.project, Number(c.count)]),
        );

        return projectsWithFeatureCount.map((projectWithCount) => {
            return {
                ...projectWithCount,
                memberCount: memberMap.get(projectWithCount.id) || 0,
            };
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    mapProjectWithCountRow(row): IProjectWithCount {
        return {
            name: row.name,
            id: row.id,
            description: row.description,
            health: row.health,
            favorite: row.favorite,
            featureCount: Number(row.number_of_features) || 0,
            staleFeatureCount: Number(row.stale_feature_count) || 0,
            potentiallyStaleFeatureCount:
                Number(row.potentially_stale_feature_count) || 0,
            memberCount: Number(row.number_of_users) || 0,
            updatedAt: row.updated_at,
            createdAt: row.created_at,
            archivedAt: row.archived_at,
            mode: row.project_mode || 'open',
            defaultStickiness: row.default_stickiness || 'default',
            avgTimeToProduction: row.avg_time_to_prod_current_window || 0,
        };
    }

    async getAll(query: IProjectQuery = {}): Promise<IProject[]> {
        let projects = this.db
            .select(COLUMNS)
            .from(TABLE)
            .where(query)
            .orderBy('name', 'asc');

        if (this.flagResolver.isEnabled('archiveProjects')) {
            projects = projects.where(`${TABLE}.archived_at`, null);
        }

        const rows = await projects;

        return rows.map(this.mapRow);
    }

    async get(id: string): Promise<IProject> {
        let extraColumns: string[] = [];
        if (this.flagResolver.isEnabled('archiveProjects')) {
            extraColumns = ['archived_at'];
        }

        return this.db
            .first([...COLUMNS, ...SETTINGS_COLUMNS, ...extraColumns])
            .from(TABLE)
            .leftJoin(
                SETTINGS_TABLE,
                `${SETTINGS_TABLE}.project`,
                `${TABLE}.id`,
            )
            .where({ id })
            .then(this.mapRow);
    }

    async exists(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async hasProject(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async hasActiveProject(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ? and archived_at IS NULL) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void> {
        await this.db(TABLE).where({ id: healthUpdate.id }).update({
            health: healthUpdate.health,
            updated_at: new Date(),
        });
    }

    async create(
        project: IProjectInsert & IProjectSettings,
    ): Promise<IProject> {
        const row = await this.db(TABLE)
            .insert(this.fieldToRow(project))
            .returning('*');
        const settingsRow = await this.db(SETTINGS_TABLE)
            .insert({
                project: project.id,
                default_stickiness: project.defaultStickiness,
                feature_limit: project.featureLimit,
                project_mode: project.mode,
            })
            .returning('*');
        return this.mapRow({ ...row[0], ...settingsRow[0] });
    }

    private async hasProjectSettings(projectId: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${SETTINGS_TABLE} WHERE project = ?) AS present`,
            [projectId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async update(data: IProjectUpdate): Promise<void> {
        try {
            await this.db(TABLE)
                .where({ id: data.id })
                .update(this.fieldToRow(data));

            if (
                data.defaultStickiness !== undefined ||
                data.featureLimit !== undefined
            ) {
                if (await this.hasProjectSettings(data.id)) {
                    await this.db(SETTINGS_TABLE)
                        .where({ project: data.id })
                        .update({
                            default_stickiness: data.defaultStickiness,
                            feature_limit: data.featureLimit,
                        });
                } else {
                    await this.db(SETTINGS_TABLE).insert({
                        project: data.id,
                        default_stickiness: data.defaultStickiness,
                        feature_limit: data.featureLimit,
                        project_mode: 'open',
                    });
                }
            }
        } catch (err) {
            this.logger.error('Could not update project, error: ', err);
        }
    }

    async updateProjectEnterpriseSettings(
        data: IProjectEnterpriseSettingsUpdate,
    ): Promise<void> {
        try {
            if (await this.hasProjectSettings(data.id)) {
                await this.db(SETTINGS_TABLE)
                    .where({ project: data.id })
                    .update({
                        project_mode: data.mode,
                        feature_naming_pattern: data.featureNaming?.pattern,
                        feature_naming_example: data.featureNaming?.example,
                        feature_naming_description:
                            data.featureNaming?.description,
                    });
            } else {
                await this.db(SETTINGS_TABLE).insert({
                    project: data.id,
                    project_mode: data.mode,
                    feature_naming_pattern: data.featureNaming?.pattern,
                    feature_naming_example: data.featureNaming?.example,
                    feature_naming_description: data.featureNaming?.description,
                });
            }
        } catch (err) {
            this.logger.error(
                'Could not update project settings, error: ',
                err,
            );
        }
    }

    async importProjects(
        projects: IProjectInsert[],
        environments?: IEnvironment[],
    ): Promise<IProject[]> {
        const rows = await this.db(TABLE)
            .insert(projects.map(this.fieldToRow))
            .returning(COLUMNS)
            .onConflict('id')
            .ignore();
        if (environments && rows.length > 0) {
            environments.forEach((env) => {
                projects.forEach(async (project) => {
                    await this.addEnvironmentToProject(project.id, env.name);
                });
            });
            return rows.map(this.mapRow);
        }
        return [];
    }

    async addDefaultEnvironment(projects: any[]): Promise<void> {
        const environments = projects.map((project) => ({
            project_id: project.id,
            environment_name: DEFAULT_ENV,
        }));
        await this.db('project_environments')
            .insert(environments)
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    async delete(id: string): Promise<void> {
        try {
            await this.db(TABLE).where({ id }).del();
        } catch (err) {
            this.logger.error('Could not delete project, error: ', err);
        }
    }

    async archive(id: string): Promise<void> {
        const now = new Date();
        await this.db(TABLE).where({ id }).update({ archived_at: now });
    }

    async revive(id: string): Promise<void> {
        await this.db(TABLE).where({ id }).update({ archived_at: null });
    }

    async getProjectLinksForEnvironments(
        environments: string[],
    ): Promise<IEnvironmentProjectLink[]> {
        const rows = await this.db('project_environments')
            .select(['project_id', 'environment_name'])
            .whereIn('environment_name', environments);
        return rows.map(this.mapLinkRow);
    }

    async deleteEnvironmentForProject(
        id: string,
        environment: string,
    ): Promise<void> {
        await this.db('project_environments')
            .where({
                project_id: id,
                environment_name: environment,
            })
            .del();
    }

    async addEnvironmentToProject(
        id: string,
        environment: string,
    ): Promise<void> {
        await this.db('project_environments')
            .insert({
                project_id: id,
                environment_name: environment,
            })
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }

    async addEnvironmentToProjects(
        environment: string,
        projects: string[],
    ): Promise<void> {
        const rows = await Promise.all(
            projects.map(async (projectId) => {
                return {
                    project_id: projectId,
                    environment_name: environment,
                };
            }),
        );

        await this.db('project_environments')
            .insert(rows)
            .onConflict(['project_id', 'environment_name'])
            .ignore();
    }

    async getEnvironmentsForProject(id: string): Promise<ProjectEnvironment[]> {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .where({
                project_id: id,
            })
            .innerJoin(
                'environments',
                'project_environments.environment_name',
                'environments.name',
            )
            .orderBy('environments.sort_order', 'asc')
            .orderBy('project_environments.environment_name', 'asc')
            .returning([
                'project_environments.environment_name',
                'project_environments.default_strategy',
            ]);

        return rows.map(this.mapProjectEnvironmentRow);
    }

    private async getMembersCount(): Promise<IProjectMembersCount[]> {
        const members = await this.db
            .select('project')
            .from((db) => {
                db.select('user_id', 'project')
                    .from('role_user')
                    .leftJoin('roles', 'role_user.role_id', 'roles.id')
                    .where((builder) => builder.whereNot('type', 'root'))
                    .union((queryBuilder) => {
                        queryBuilder
                            .select('user_id', 'project')
                            .from('group_role')
                            .leftJoin(
                                'group_user',
                                'group_user.group_id',
                                'group_role.group_id',
                            );
                    })
                    .as('query');
            })
            .groupBy('project')
            .count('user_id');
        return members;
    }

    async getProjectsByUser(userId: number): Promise<string[]> {
        const projects = await this.db
            .from((db) => {
                db.select('project')
                    .from('role_user')
                    .leftJoin('roles', 'role_user.role_id', 'roles.id')
                    .where('user_id', userId)
                    .union((queryBuilder) => {
                        queryBuilder
                            .select('project')
                            .from('group_role')
                            .leftJoin(
                                'group_user',
                                'group_user.group_id',
                                'group_role.group_id',
                            )
                            .where('user_id', userId);
                    })
                    .as('query');
            })
            .pluck('project');
        return projects;
    }

    async getMembersCountByProject(projectId: string): Promise<number> {
        const members = await this.db
            .from((db) => {
                db.select('user_id')
                    .from('role_user')
                    .leftJoin('roles', 'role_user.role_id', 'roles.id')
                    .where((builder) =>
                        builder
                            .where('project', projectId)
                            .whereNot('type', 'root'),
                    )
                    .union((queryBuilder) => {
                        queryBuilder
                            .select('user_id')
                            .from('group_role')
                            .leftJoin(
                                'group_user',
                                'group_user.group_id',
                                'group_role.group_id',
                            )
                            .where('project', projectId);
                    })
                    .as('query');
            })
            .count()
            .first();
        return Number(members.count);
    }

    async getMembersCountByProjectAfterDate(
        projectId: string,
        date: string,
    ): Promise<number> {
        const members = await this.db
            .from((db) => {
                db.select('user_id')
                    .from('role_user')
                    .leftJoin('roles', 'role_user.role_id', 'roles.id')
                    .where((builder) =>
                        builder
                            .where('project', projectId)
                            .whereNot('type', 'root')
                            .andWhere('role_user.created_at', '>=', date),
                    )
                    .union((queryBuilder) => {
                        queryBuilder
                            .select('user_id')
                            .from('group_role')
                            .leftJoin(
                                'group_user',
                                'group_user.group_id',
                                'group_role.group_id',
                            )
                            .where('project', projectId)
                            .andWhere('group_role.created_at', '>=', date);
                    })
                    .as('query');
            })
            .count()
            .first();
        return Number(members.count);
    }

    async getApplicationsByProject(
        params: IProjectApplicationsSearchParams,
    ): Promise<IProjectApplications> {
        const { project, limit, sortOrder, sortBy, searchParams, offset } =
            params;
        const validatedSortOrder =
            sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';
        const query = this.db
            .with('applications', (qb) => {
                qb.select('project', 'app_name', 'environment')
                    .distinct()
                    .from('client_metrics_env as cme')
                    .leftJoin('features as f', 'cme.feature_name', 'f.name')
                    .where('project', project);
            })
            .with('ranked', (qb) => {
                applySearchFilters(qb, searchParams, [
                    'a.app_name',
                    'a.environment',
                    'ci.instance_id',
                    'ci.sdk_version',
                ]);

                qb.select(
                    'a.app_name',
                    'a.environment',
                    'ci.instance_id',
                    'ci.sdk_version',
                    this.db.raw(
                        `DENSE_RANK() OVER (ORDER BY a.app_name ${validatedSortOrder}) AS rank`,
                    ),
                )
                    .from('applications as a')
                    .innerJoin(
                        'client_applications as ca',
                        'a.app_name',
                        'ca.app_name',
                    )
                    .leftJoin('client_instances as ci', function () {
                        this.on('ci.app_name', '=', 'a.app_name').andOn(
                            'ci.environment',
                            '=',
                            'a.environment',
                        );
                    });
            })
            .with(
                'final_ranks',
                this.db.raw(
                    'select row_number() over (order by min(rank)) as final_rank from ranked group by app_name',
                ),
            )
            .with(
                'total',
                this.db.raw('select count(*) as total from final_ranks'),
            )
            .select('*')
            .from('ranked')
            .joinRaw('CROSS JOIN total')
            .whereBetween('rank', [offset + 1, offset + limit]);
        const rows = await query;
        if (rows.length !== 0) {
            const applications = this.getAggregatedApplicationsData(rows);
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

    async getDefaultStrategy(
        projectId: string,
        environment: string,
    ): Promise<CreateFeatureStrategySchema | null> {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .select('default_strategy')
            .where({
                project_id: projectId,
                environment_name: environment,
            });

        return rows.length > 0 ? rows[0].default_strategy : null;
    }

    async updateDefaultStrategy(
        projectId: string,
        environment: string,
        strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema> {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .update({
                default_strategy: strategy,
            })
            .where({
                project_id: projectId,
                environment_name: environment,
            })
            .returning('default_strategy');

        return rows[0].default_strategy;
    }

    async count(): Promise<number> {
        let count = this.db.from(TABLE).count('*');

        if (this.flagResolver.isEnabled('archiveProjects')) {
            count = count.where(`${TABLE}.archived_at`, null);
        }

        return count.then((res) => Number(res[0].count));
    }

    async getProjectModeCounts(): Promise<ProjectModeCount[]> {
        let query = this.db
            .select(
                this.db.raw(
                    `COALESCE(${SETTINGS_TABLE}.project_mode, 'open') as mode`,
                ),
            )
            .count(`${TABLE}.id as count`)
            .from(`${TABLE}`)
            .leftJoin(
                `${SETTINGS_TABLE}`,
                `${TABLE}.id`,
                `${SETTINGS_TABLE}.project`,
            )
            .groupBy(
                this.db.raw(`COALESCE(${SETTINGS_TABLE}.project_mode, 'open')`),
            );

        if (this.flagResolver.isEnabled('archiveProjects')) {
            query = query.where(`${TABLE}.archived_at`, null);
        }

        const result: ProjectModeCount[] = await query;

        return result.map(this.mapProjectModeCount);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private mapProjectModeCount(row): ProjectModeCount {
        return {
            mode: row.mode,
            count: Number(row.count),
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private mapLinkRow(row): IEnvironmentProjectLink {
        return {
            environmentName: row.environment_name,
            projectId: row.project_id,
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private mapRow(row): IProject {
        if (!row) {
            throw new NotFoundError('No project found');
        }

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            health: row.health ?? 100,
            updatedAt: row.updated_at || new Date(),
            ...(row.archived_at ? { archivedAt: row.archived_at } : {}),
            mode: row.project_mode || 'open',
            defaultStickiness: row.default_stickiness || 'default',
            featureLimit: row.feature_limit,
            featureNaming: {
                pattern: row.feature_naming_pattern,
                example: row.feature_naming_example,
                description: row.feature_naming_description,
            },
        };
    }

    private mapProjectEnvironmentRow(row: {
        environment_name: string;
        default_strategy: CreateFeatureStrategySchema;
    }): ProjectEnvironment {
        return {
            environment: row.environment_name,
            defaultStrategy:
                row.default_strategy === null
                    ? undefined
                    : row.default_strategy,
        };
    }

    private getAggregatedApplicationsData(rows): IProjectApplication[] {
        const entriesMap = new Map<string, IProjectApplication>();

        rows.forEach((row) => {
            const { app_name, environment, instance_id, sdk_version } = row;
            let entry = entriesMap.get(app_name);

            if (!entry) {
                entry = {
                    name: app_name,
                    environments: [],
                    instances: [],
                    sdks: [],
                };
                entriesMap.set(app_name, entry);
            }

            if (!entry.environments.includes(environment)) {
                entry.environments.push(environment);
            }

            if (!entry.instances.includes(instance_id)) {
                entry.instances.push(instance_id);
            }

            if (sdk_version) {
                const sdkParts = sdk_version.split(':');
                const sdkName = sdkParts[0];
                const sdkVersion = sdkParts[1] || '';
                let sdk = entry.sdks.find((sdk) => sdk.name === sdkName);

                if (!sdk) {
                    sdk = {
                        name: sdkName,
                        versions: [],
                    };
                    entry.sdks.push(sdk);
                }

                if (sdkVersion && !sdk.versions.includes(sdkVersion)) {
                    sdk.versions.push(sdkVersion);
                }
            }
        });

        entriesMap.forEach((entry) => {
            entry.environments.sort();
            entry.instances.sort();
            entry.sdks.forEach((sdk) => {
                sdk.versions.sort();
            });
            entry.sdks.sort((a, b) => a.name.localeCompare(b.name));
        });

        return Array.from(entriesMap.values());
    }
}

export default ProjectStore;
