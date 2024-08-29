import type { IFlagResolver } from '../../types';
import { Knex } from 'knex';
import type { Db } from '../../db/db';
import type {
    IProjectReadModel,
    ProjectForInsights,
    ProjectForUi,
} from './project-read-model-type';
import type { IProjectQuery } from './project-store-type';
import metricsHelper from '../../util/metrics-helper';
import type EventEmitter from 'events';
import type { IProjectMembersCount } from './project-store';
import Raw = Knex.Raw;

const TABLE = 'projects';
const DB_TIME = 'db_time';

const mapProjectForUi = (row): ProjectForUi => {
    return {
        name: row.name,
        id: row.id,
        description: row.description,
        health: row.health,
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

    async getProjectsForAdminUi(
        query?: IProjectQuery,
        userId?: number,
    ): Promise<ProjectForUi[]> {
        const projectTimer = this.timer('getProjectsForAdminUi');
        let projects = this.db(TABLE)
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
            .leftJoin('events', (join) => {
                join.on('events.feature_name', '=', 'features.name').andOn(
                    'events.project',
                    '=',
                    'projects.id',
                );
            })
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
                'projects.id, projects.name, projects.description, projects.health, projects.created_at, ' +
                    'count(DISTINCT features.name) FILTER (WHERE features.archived_at is null) AS number_of_features, ' +
                    'MAX(last_seen_at_metrics.last_seen_at) AS last_usage, ' +
                    'MAX(events.created_at) AS last_updated',
            ),
            'project_settings.project_mode',
        ] as (string | Raw<any>)[];

        if (this.flagResolver.isEnabled('archiveProjects')) {
            selectColumns.push(`${TABLE}.archived_at`);
        }

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

    async getProjectsForInsights(
        query?: IProjectQuery,
    ): Promise<ProjectForInsights[]> {
        const projectTimer = this.timer('getProjectsForInsights');
        let projects = this.db(TABLE)
            .leftJoin('features', 'features.project', 'projects.id')
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

        const selectColumns = [
            this.db.raw(
                'projects.id, projects.health, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null) AS number_of_features, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null and features.stale IS TRUE) AS stale_feature_count, ' +
                    'count(features.name) FILTER (WHERE features.archived_at is null and features.potentially_stale IS TRUE) AS potentially_stale_feature_count',
            ),
            'project_stats.avg_time_to_prod_current_window',
        ] as (string | Raw<any>)[];

        if (this.flagResolver.isEnabled('archiveProjects')) {
            selectColumns.push(`${TABLE}.archived_at`);
        }

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
}
