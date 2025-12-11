import type { Logger } from '../../logger.js';

import NotFoundError from '../../error/notfound-error.js';
import type {
    IEnvironment,
    IProject,
    IProjectApplication,
    IProjectApplications,
    IProjectLinkTemplate,
    IProjectUpdate,
    IUnleashConfig,
    ProjectMode,
} from '../../types/index.js';
import type {
    IProjectHealthUpdate,
    IProjectInsert,
    IProjectQuery,
    IProjectEnterpriseSettingsUpdate,
    IProjectStore,
    ProjectEnvironment,
    IProjectApplicationsSearchParams,
} from '../../features/project/project-store-type.js';
import { DEFAULT_ENV } from '../../util/index.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type EventEmitter from 'events';
import type { Db } from '../../db/db.js';
import type { CreateFeatureStrategySchema } from '../../openapi/index.js';
import { applySearchFilters } from '../feature-search/search-utils.js';

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
    'link_templates',
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

    private isOss: boolean;

    private timer: Function;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        { getLogger, isOss }: Pick<IUnleashConfig, 'getLogger' | 'isOss'>,
    ) {
        this.db = db;
        this.logger = getLogger('project-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'project',
                action,
            });
        this.isOss = isOss;
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
        const stop = this.timer('isFeatureLimitReached');
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
        stop();
        const { present } = result.rows[0];
        return present;
    }

    async getProjectLinkTemplates(id: string): Promise<IProjectLinkTemplate[]> {
        const stop = this.timer('getProjectLinkTemplates');
        const result = await this.db
            .select('link_templates')
            .from(SETTINGS_TABLE)
            .where({ project: id })
            .first();
        stop();
        return result?.link_templates || [];
    }

    async getAll(query: IProjectQuery = {}): Promise<IProject[]> {
        const stop = this.timer('getAll');
        let projects = this.db
            .select(COLUMNS)
            .from(TABLE)
            .where(query)
            .orderBy('name', 'asc');

        projects = projects.where(`${TABLE}.archived_at`, null);
        if (this.isOss) {
            projects = projects.where('id', 'default');
        }

        const rows = await projects;
        stop();
        return rows.map(this.mapRow.bind(this));
    }

    async get(id: string): Promise<IProject> {
        const stop = this.timer('getProject');
        const extraColumns: string[] = ['archived_at'];

        const project = await this.db
            .first([...COLUMNS, ...SETTINGS_COLUMNS, ...extraColumns])
            .from(TABLE)
            .leftJoin(
                SETTINGS_TABLE,
                `${SETTINGS_TABLE}.project`,
                `${TABLE}.id`,
            )
            .where({ id })
            .then(this.mapRow.bind(this));
        stop();
        return project;
    }

    async exists(id: string): Promise<boolean> {
        const stop = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        stop();
        return present;
    }

    async hasProject(id: string): Promise<boolean> {
        const stop = this.timer('hasProject');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        stop();
        return present;
    }

    async hasActiveProject(id: string): Promise<boolean> {
        const stop = this.timer('hasActiveProject');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ? and archived_at IS NULL) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        stop();
        return present;
    }

    async updateHealth(healthUpdate: IProjectHealthUpdate): Promise<void> {
        const stop = this.timer('updateHealth');
        await this.db(TABLE).where({ id: healthUpdate.id }).update({
            health: healthUpdate.health,
            updated_at: new Date(),
        });
        stop();
    }

    async create(project: IProjectInsert): Promise<IProject> {
        const stop = this.timer('create');
        const row = await this.db(TABLE)
            .insert({ ...this.fieldToRow(project), created_at: new Date() })
            .returning('*');
        const settingsRow = await this.db(SETTINGS_TABLE)
            .insert({
                project: project.id,
                default_stickiness: project.defaultStickiness,
                feature_limit: project.featureLimit,
                project_mode: project.mode,
            })
            .returning('*');
        stop();
        return this.mapRow({ ...row[0], ...settingsRow[0] });
    }

    private async hasProjectSettings(projectId: string): Promise<boolean> {
        const stop = this.timer('hasProjectSettings');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${SETTINGS_TABLE} WHERE project = ?) AS present`,
            [projectId],
        );
        const { present } = result.rows[0];
        stop();
        return present;
    }

    async update(data: IProjectUpdate): Promise<void> {
        const stop = this.timer('update');
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
        } finally {
            stop();
        }
    }

    async updateProjectEnterpriseSettings(
        data: IProjectEnterpriseSettingsUpdate,
    ): Promise<void> {
        const stop = this.timer('updateProjectEnterpriseSettings');
        try {
            const link_templates = JSON.stringify(
                data.linkTemplates ? data.linkTemplates : [],
            );

            if (await this.hasProjectSettings(data.id)) {
                await this.db(SETTINGS_TABLE)
                    .where({ project: data.id })
                    .update({
                        project_mode: data.mode,
                        feature_naming_pattern: data.featureNaming?.pattern,
                        feature_naming_example: data.featureNaming?.example,
                        feature_naming_description:
                            data.featureNaming?.description,
                        link_templates,
                    });
            } else {
                await this.db(SETTINGS_TABLE).insert({
                    project: data.id,
                    project_mode: data.mode,
                    feature_naming_pattern: data.featureNaming?.pattern,
                    feature_naming_example: data.featureNaming?.example,
                    feature_naming_description: data.featureNaming?.description,
                    link_templates,
                });
            }
        } catch (err) {
            this.logger.error(
                'Could not update project settings, error: ',
                err,
            );
        } finally {
            stop();
        }
    }

    async importProjects(
        projects: IProjectInsert[],
        environments?: IEnvironment[],
    ): Promise<IProject[]> {
        const stop = this.timer('importProjects');
        const rows = await this.db(TABLE)
            .insert(projects.map(this.fieldToRow))
            .returning(COLUMNS)
            .onConflict('id')
            .ignore();
        stop();
        if (environments && rows.length > 0) {
            environments.forEach((env) => {
                projects.forEach(async (project) => {
                    await this.addEnvironmentToProject(project.id, env.name);
                });
            });
            return rows.map(this.mapRow, this);
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
        const stop = this.timer('deleteAll');
        await this.db(TABLE).del();
        stop();
    }

    async delete(id: string): Promise<void> {
        const stop = this.timer('deleteAll');
        try {
            await this.db(TABLE).where({ id }).del();
        } catch (err) {
            this.logger.error('Could not delete project, error: ', err);
        } finally {
            stop();
        }
    }

    async archive(id: string): Promise<void> {
        const stop = this.timer('archive');
        const now = new Date();
        await this.db(TABLE).where({ id }).update({ archived_at: now });
        stop();
    }

    async revive(id: string): Promise<void> {
        const stop = this.timer('revive');
        await this.db(TABLE).where({ id }).update({ archived_at: null });
        stop();
    }

    async getProjectLinksForEnvironments(
        environments: string[],
    ): Promise<IEnvironmentProjectLink[]> {
        const rows = await this.db('project_environments')
            .select(['project_id', 'environment_name'])
            .whereIn('environment_name', environments);
        return rows.map(this.mapLinkRow, this);
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

        return rows.map(this.mapProjectEnvironmentRow, this);
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
        const { project, limit, sortOrder, searchParams, offset } = params;
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
    ): Promise<CreateFeatureStrategySchema | undefined> {
        const rows = await this.db(PROJECT_ENVIRONMENTS)
            .select('default_strategy')
            .where({
                project_id: projectId,
                environment_name: environment,
            });

        return rows.length > 0 ? rows[0].default_strategy : undefined;
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

        count = count.where(`${TABLE}.archived_at`, null);

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

        query = query.where(`${TABLE}.archived_at`, null);

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
            linkTemplates: row.link_templates || [],
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
