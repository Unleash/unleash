import type { IFlagResolver } from '../../types/index.js';
import { Knex } from 'knex';
import type { Db } from '../../db/db.js';
import type {
    IProjectReadModel,
    ProjectForInsights,
    ProjectForUi,
} from './project-read-model-type.js';
import type { IProjectQuery, IProjectsQuery } from './project-store-type.js';
import type { IProjectMembersCount } from './project-store.js';
import metricsHelper from '../../util/metrics-helper.js';
import type EventEmitter from 'events';
import Raw = Knex.Raw;

const TABLE = 'projects';
const DB_TIME = 'db_time';

const mapProjectForUi = (row): ProjectForUi => {
    return {
        name: row.name,
        id: row.id,
        description: row.description,
        health: row.health,
        technicalDebt: 100 - (row.health || 0),
        favorite: row.favorite,
        featureCount: Number(row.number_of_features) || 0,
        memberCount: Number(row.number_of_users) || 0,
        createdAt: row.created_at,
        archivedAt: row.archived_at,
        mode: row.project_mode || 'open',
        lastReportedFlagUsage: row.last_usage,
        lastUpdatedAt: row.last_updated,
    };
};

const mapProjectForInsights = (row): ProjectForInsights => {
    return {
        id: row.id,
        health: row.health,
        featureCount: Number(row.number_of_features) || 0,
        staleFeatureCount: Number(row.stale_feature_count) || 0,
        potentiallyStaleFeatureCount:
            Number(row.potentially_stale_feature_count) || 0,
        memberCount: Number(row.number_of_users) || 0,
        avgTimeToProduction: row.avg_time_to_prod_current_window || 0,
        technicalDebt: 100 - (row.health || 0),
    };
};

export class ProjectReadModel implements IProjectReadModel {
    private db: Db;

    private timer: Function;

    private flagResolver: IFlagResolver;

    constructor(db: Db, eventBus: EventEmitter, flagResolver: IFlagResolver) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'project',
                action,
            });
        this.flagResolver = flagResolver;
    }

    async getFeatureProject(
        featureName: string,
    ): Promise<{ project: string; createdAt: Date } | null> {
        const result = await this.db<{ project: string; created_at: Date }>(
            'features',
        )
            .join('projects', 'features.project', '=', 'projects.id')
            .select('features.project', 'projects.created_at')
            .where('features.name', featureName)
            .first();

        if (!result) return null;

        return { project: result.project, createdAt: result.created_at };
    }

    async getProjectsForAdminUi(
        query?: IProjectQuery & IProjectsQuery,
        userId?: number,
    ): Promise<ProjectForUi[]> {
        const projectTimer = this.timer('getProjectsForAdminUi');
        let projects = this.db
            .with('latest_events', (qb) => {
                qb.select('project', 'feature_name')
                    .max('created_at as last_updated')
                    .whereNotNull('feature_name')
                    .from('events')
                    .groupBy('project', 'feature_name');
            })
            .leftJoin('features', 'features.project', 'projects.id')
            .leftJoin(
                'last_seen_at_metrics',
                'features.name',
                'last_seen_at_metrics.feature_name',
            )
            .leftJoin(
                'project_settings',
                'project_settings.project',
                'projects.id',
            )
            .leftJoin('latest_events', (join) => {
                join.on(
                    'latest_events.feature_name',
                    '=',
                    'features.name',
                ).andOn('latest_events.project', '=', 'projects.id');
            })
            .from(TABLE)
            .orderBy('projects.name', 'asc');

        if (query?.archived === true) {
            projects = projects.whereNot(`${TABLE}.archived_at`, null);
        } else {
            projects = projects.where(`${TABLE}.archived_at`, null);
        }

        if (query?.id) {
            projects = projects.where(`${TABLE}.id`, query.id);
        }
        if (query?.ids) {
            projects = projects.whereIn(`${TABLE}.id`, query.ids);
        }

        let selectColumns = [
            this.db.raw(
                'projects.id, projects.name, projects.description, projects.health, projects.created_at, ' +
                    'count(DISTINCT features.name) FILTER (WHERE features.archived_at is null) AS number_of_features, ' +
                    'MAX(last_seen_at_metrics.last_seen_at) AS last_usage, ' +
                    'MAX(latest_events.last_updated) AS last_updated',
            ),
            'project_settings.project_mode',
            'projects.archived_at',
        ] as (string | Raw<any>)[];

        let groupByColumns = ['projects.id', 'project_settings.project_mode'];

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

        const projectsWithFeatureCount =
            projectAndFeatureCount.map(mapProjectForUi);
        projectTimer();

        const memberCount = await this.getMembersCount();
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

    async getProjectsForAdminUiWithJoinedQuery(
        query?: IProjectQuery & IProjectsQuery,
        userId?: number,
    ): Promise<ProjectForUi[]> {
        const projectTimer = this.timer('getProjectsForAdminUi');
        let projects = this.db
            .with('latest_events', (qb) => {
                qb.select('project', 'feature_name')
                    .max('created_at as last_updated')
                    .whereNotNull('feature_name')
                    .from('events')
                    .groupBy('project', 'feature_name');
            })
            .with('member_counts', (qb) => {
                qb.select('project')
                    .select(this.db.raw('count(user_id) as count'))
                    .from((db) => {
                        db.select('user_id', 'project')
                            .from('role_user')
                            .leftJoin('roles', 'role_user.role_id', 'roles.id')
                            .where((builder) =>
                                builder.whereNot('type', 'root'),
                            )
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
                    .groupBy('project');
            })
            .leftJoin('features', 'features.project', 'projects.id')
            .leftJoin(
                'last_seen_at_metrics',
                'features.name',
                'last_seen_at_metrics.feature_name',
            )
            .leftJoin(
                'project_settings',
                'project_settings.project',
                'projects.id',
            )
            .leftJoin('latest_events', (join) => {
                join.on(
                    'latest_events.feature_name',
                    '=',
                    'features.name',
                ).andOn('latest_events.project', '=', 'projects.id');
            })
            .leftJoin('member_counts', 'member_counts.project', 'projects.id')
            .from(TABLE)
            .orderBy('projects.name', 'asc');

        if (query?.archived === true) {
            projects = projects.whereNot(`${TABLE}.archived_at`, null);
        } else {
            projects = projects.where(`${TABLE}.archived_at`, null);
        }

        if (query?.id) {
            projects = projects.where(`${TABLE}.id`, query.id);
        }
        if (query?.ids) {
            projects = projects.whereIn(`${TABLE}.id`, query.ids);
        }

        let selectColumns = [
            this.db.raw(
                'projects.id, projects.name, projects.description, projects.health, projects.created_at, ' +
                    'count(DISTINCT features.name) FILTER (WHERE features.archived_at is null) AS number_of_features, ' +
                    'MAX(last_seen_at_metrics.last_seen_at) AS last_usage, ' +
                    'MAX(latest_events.last_updated) AS last_updated, ' +
                    'COALESCE(member_counts.count, 0) AS number_of_users',
            ),
            'project_settings.project_mode',
            'projects.archived_at',
        ] as (string | Raw<any>)[];

        let groupByColumns = [
            'projects.id',
            'project_settings.project_mode',
            'member_counts.count',
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

        const projectsWithFeatureCount =
            projectAndFeatureCount.map(mapProjectForUi);
        projectTimer();

        return projectsWithFeatureCount;
    }

    async getProjectsForInsights(
        query?: IProjectQuery,
    ): Promise<ProjectForInsights[]> {
        const projectTimer = this.timer('getProjectsForInsights');
        let projects = this.db(TABLE)
            .leftJoin('features', 'features.project', 'projects.id')
            .leftJoin('project_stats', 'project_stats.project', 'projects.id')
            .orderBy('projects.name', 'asc');

        if (query?.archived === true) {
            projects = projects.whereNot(`${TABLE}.archived_at`, null);
        } else {
            projects = projects.where(`${TABLE}.archived_at`, null);
        }

        if (query?.id) {
            projects = projects.where(`${TABLE}.id`, query.id);
        }

        const selectColumns = [
            this.db.raw(
                'projects.id, projects.health, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null) AS number_of_features, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null and features.stale IS TRUE) AS stale_feature_count, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null and features.potentially_stale IS TRUE and features.stale IS FALSE) AS potentially_stale_feature_count',
            ),
            'project_stats.avg_time_to_prod_current_window',
            'projects.archived_at',
        ] as (string | Raw<any>)[];

        const groupByColumns = [
            'projects.id',
            'project_stats.avg_time_to_prod_current_window',
        ];

        const projectAndFeatureCount = await projects
            .select(selectColumns)
            .groupBy(groupByColumns);

        const projectsWithFeatureCount = projectAndFeatureCount.map(
            mapProjectForInsights,
        );
        projectTimer();

        const memberCount = await this.getMembersCount();
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

    private async getMembersCount(): Promise<IProjectMembersCount[]> {
        const memberTimer = this.timer('getMembersCount');
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

        memberTimer();
        return members;
    }

    async getProjectsByUser(userId: number): Promise<string[]> {
        const projects = await this.db
            .from((db) => {
                db.select('role_user.project')
                    .from('role_user')
                    .leftJoin('roles', 'role_user.role_id', 'roles.id')
                    .leftJoin('projects', 'role_user.project', 'projects.id')
                    .where('user_id', userId)
                    .andWhere('projects.archived_at', null)
                    .union((queryBuilder) => {
                        queryBuilder
                            .select('group_role.project')
                            .from('group_role')
                            .leftJoin(
                                'group_user',
                                'group_user.group_id',
                                'group_role.group_id',
                            )
                            .leftJoin(
                                'projects',
                                'group_role.project',
                                'projects.id',
                            )
                            .where('group_user.user_id', userId)
                            .andWhere('projects.archived_at', null);
                    })
                    .as('query');
            })
            .pluck('project');
        return projects;
    }

    async getProjectsFavoritedByUser(userId: number): Promise<string[]> {
        const favoritedProjects = await this.db
            .select('favorite_projects.project')
            .from('favorite_projects')
            .leftJoin('projects', 'favorite_projects.project', 'projects.id')
            .where('favorite_projects.user_id', userId)
            .andWhere('projects.archived_at', null)
            .pluck('project');

        return favoritedProjects;
    }
}
