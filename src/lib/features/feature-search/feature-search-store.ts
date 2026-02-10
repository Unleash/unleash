import { Knex } from 'knex';
import type EventEmitter from 'events';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type { LogProvider } from '../../logger.js';
import type {
    FeatureSearchEnvironment,
    IFeatureSearchOverview,
    IFeatureSearchStore,
    IFlagResolver,
} from '../../types/index.js';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store.js';
import type { Db } from '../../db/db.js';
import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import {
    applyGenericQueryParams,
    applySearchFilters,
    parseSearchOperatorValue,
} from './search-utils.js';
import { generateImageUrl } from '../../util/index.js';
import Raw = Knex.Raw;
import type { ITag } from '../../tags/index.js';

const sortEnvironments = (overview: IFeatureSearchOverview[]) => {
    return overview.map((data: IFeatureSearchOverview) => ({
        ...data,
        environments: data.environments
            .filter((f) => f.name)
            .sort((a, b) => {
                if (a.sortOrder === b.sortOrder) {
                    return a.name.localeCompare(b.name);
                }
                return a.sortOrder - b.sortOrder;
            }),
    }));
};

class FeatureSearchStore implements IFeatureSearchStore {
    private db: Db;

    private readonly timer: Function;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        _getLogger: LogProvider,
        _flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-search',
                action,
            });
    }

    private static getEnvironment(r: any): FeatureSearchEnvironment {
        return {
            name: r.environment,
            enabled: r.enabled,
            type: r.environment_type,
            sortOrder: r.environment_sort_order,
            variantCount: r.variants?.length || 0,
            lastSeenAt: r.env_last_seen_at,
            hasStrategies: r.has_strategies,
            hasEnabledStrategies: r.has_enabled_strategies,
            yes: Number(r.yes) || 0,
            no: Number(r.no) || 0,
            changeRequestIds: r.change_request_ids ?? [],
            ...(r.milestone_name
                ? {
                      milestoneName: r.milestone_name,
                      milestoneOrder: r.milestone_order,
                      totalMilestones: Number(r.total_milestones || 0),
                  }
                : {}),
        };
    }

    async searchFeatures(
        {
            userId,
            searchParams,
            status,
            offset,
            limit,
            lifecycle,
            sortOrder,
            sortBy,
            archived,
            favoritesFirst,
        }: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{
        features: IFeatureSearchOverview[];
        total: number;
    }> {
        const stopTimer = this.timer('searchFeatures');
        const validatedSortOrder =
            sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';

        const finalQuery = this.db
            .with('ranked_features', (query) => {
                query.from('features');

                let selectColumns = [
                    'features.name as feature_name',
                    'features.description as description',
                    'features.type as type',
                    'features.archived_at as archived_at',
                    'features.project as project',
                    'features.created_at as created_at',
                    'features.stale as stale',
                    'features.last_seen_at as last_seen_at',
                    'features.impression_data as impression_data',
                    'feature_environments.enabled as enabled',
                    'feature_environments.environment as environment',
                    'feature_environments.variants as variants',
                    'environments.type as environment_type',
                    'environments.sort_order as environment_sort_order',
                    'ft.tag_value as tag_value',
                    'ft.tag_type as tag_type',
                    'tag_types.color as tag_type_color',
                    'segments.name as segment_name',
                    'users.id as user_id',
                    'users.name as user_name',
                    'users.username as user_username',
                    'users.email as user_email',
                    'users.image_url as user_image_url',
                    'lifecycle.latest_stage',
                    'lifecycle.stage_status',
                    'lifecycle.entered_stage_at',
                ] as (string | Raw<any> | Knex.QueryBuilder)[];

                const lastSeenQuery = 'last_seen_at_metrics.last_seen_at';
                selectColumns.push(`${lastSeenQuery} as env_last_seen_at`);

                if (userId) {
                    query.leftJoin(`favorite_features`, function () {
                        this.on(
                            'favorite_features.feature',
                            'features.name',
                        ).andOnVal('favorite_features.user_id', '=', userId);
                    });
                    selectColumns = [
                        ...selectColumns,
                        this.db.raw(
                            'favorite_features.feature is not null as favorite',
                        ),
                    ];
                }

                selectColumns = [
                    ...selectColumns,
                    this.db.raw(`CASE
                            WHEN dependent_features.parent = features.name THEN 'parent'
                            WHEN dependent_features.child = features.name THEN 'child'
                            ELSE null
                            END AS dependency`),
                ];

                applyQueryParams(query, queryParams);
                applySearchFilters(query, searchParams, [
                    'features.name',
                    'features.description',
                ]);

                if (status && status.length > 0) {
                    query.where((builder) => {
                        for (const [envName, envStatus] of status) {
                            builder.orWhere(function () {
                                this.where(
                                    'feature_environments.environment',
                                    envName,
                                ).andWhere(
                                    'feature_environments.enabled',
                                    envStatus === 'enabled',
                                );
                            });
                        }
                    });
                }
                query
                    .modify(FeatureToggleStore.filterByArchived, archived)
                    .leftJoin(
                        'feature_environments',
                        'feature_environments.feature_name',
                        'features.name',
                    )
                    .leftJoin(
                        'environments',
                        'feature_environments.environment',
                        'environments.name',
                    )
                    .leftJoin(
                        'feature_tag as ft',
                        'ft.feature_name',
                        'features.name',
                    )
                    .leftJoin('tag_types', 'tag_types.name', 'ft.tag_type')
                    .leftJoin(
                        'feature_strategies',
                        'feature_strategies.feature_name',
                        'features.name',
                    )
                    .leftJoin(
                        'feature_strategy_segment',
                        'feature_strategy_segment.feature_strategy_id',
                        'feature_strategies.id',
                    )
                    .leftJoin(
                        'segments',
                        'feature_strategy_segment.segment_id',
                        'segments.id',
                    )
                    .leftJoin('dependent_features', (qb) => {
                        qb.on(
                            'dependent_features.parent',
                            '=',
                            'features.name',
                        ).orOn(
                            'dependent_features.child',
                            '=',
                            'features.name',
                        );
                    })
                    .leftJoin(
                        'users',
                        'users.id',
                        'features.created_by_user_id',
                    )
                    .leftJoin('last_seen_at_metrics', function () {
                        this.on(
                            'last_seen_at_metrics.environment',
                            '=',
                            'environments.name',
                        ).andOn(
                            'last_seen_at_metrics.feature_name',
                            '=',
                            'features.name',
                        );
                    })
                    .leftJoin(
                        this.db
                            .select(
                                'feature as stage_feature',
                                'stage as latest_stage',
                                'status as stage_status',
                                'created_at as entered_stage_at',
                            )
                            .from('feature_lifecycles')
                            .distinctOn('feature')
                            .orderBy([
                                'feature',
                                { column: 'created_at', order: 'desc' },
                            ])
                            .as('lifecycle'),
                        'features.name',
                        'lifecycle.stage_feature',
                    );

                const parsedLifecycle = lifecycle
                    ? parseSearchOperatorValue(
                          'lifecycle.latest_stage',
                          lifecycle,
                      )
                    : null;
                if (parsedLifecycle) {
                    applyGenericQueryParams(query, [parsedLifecycle]);
                }

                const rankingSql = this.buildRankingSql(
                    favoritesFirst,
                    sortBy || '',
                    validatedSortOrder,
                    lastSeenQuery,
                );

                query
                    .select(selectColumns)
                    .denseRank('rank', this.db.raw(rankingSql));
            })
            .with(
                'final_ranks',
                this.db.raw(
                    'select feature_name, row_number() over (order by min(rank)) as final_rank from ranked_features group by feature_name',
                ),
            )
            .with(
                'total_features',
                this.db.raw('select count(*) as total from final_ranks'),
            )
            .with('metrics', (queryBuilder) => {
                queryBuilder
                    .sum('yes as yes')
                    .sum('no as no')
                    .select([
                        'client_metrics_env.environment as metric_environment',
                        'client_metrics_env.feature_name as metric_feature_name',
                    ])
                    .from('client_metrics_env')
                    .innerJoin(
                        'final_ranks',
                        'client_metrics_env.feature_name',
                        'final_ranks.feature_name',
                    )
                    .where(
                        'client_metrics_env.timestamp',
                        '>=',
                        this.db.raw("NOW() - INTERVAL '1 hour'"),
                    )
                    .groupBy([
                        'client_metrics_env.feature_name',
                        'client_metrics_env.environment',
                    ]);
            })
            .select([
                'ranked_features.*',
                'total_features.total',
                'final_ranks.final_rank',
                'metrics.yes',
                'metrics.no',
            ])
            .from('ranked_features')
            .innerJoin(
                'final_ranks',
                'ranked_features.feature_name',
                'final_ranks.feature_name',
            )
            .joinRaw('CROSS JOIN total_features')
            .whereBetween('final_rank', [offset + 1, offset + limit])
            .orderBy('final_rank');

        this.buildChangeRequestSql(finalQuery);
        this.buildReleasePlanSql(finalQuery);

        this.queryExtraData(finalQuery);
        const rows = await finalQuery;
        stopTimer();
        if (rows.length > 0) {
            const overview = this.getAggregatedSearchData(rows);
            const features = sortEnvironments(
                overview,
            ) as IFeatureSearchOverview[];
            return {
                features,
                total: Number(rows[0].total) || 0,
            };
        }

        return {
            features: [],
            total: 0,
        };
    }
    /*
        This is noncritical data that can should be joined after paging and is not part of filtering/sorting
     */
    private queryExtraData(queryBuilder: Knex.QueryBuilder) {
        this.queryMetrics(queryBuilder);
        this.queryStrategiesByEnvironment(queryBuilder);
    }

    private queryMetrics(queryBuilder: Knex.QueryBuilder) {
        queryBuilder.leftJoin('metrics', (qb) => {
            qb.on(
                'metric_environment',
                '=',
                'ranked_features.environment',
            ).andOn('metric_feature_name', '=', 'ranked_features.feature_name');
        });
    }

    private queryStrategiesByEnvironment(queryBuilder: Knex.QueryBuilder) {
        queryBuilder.select(
            this.db.raw(
                'has_strategies.feature_name IS NOT NULL AS has_strategies',
            ),
            this.db.raw(
                'enabled_strategies.feature_name IS NOT NULL AS has_enabled_strategies',
            ),
        );
        queryBuilder
            .leftJoin(
                this.db
                    .select('fs.feature_name', 'fs.environment')
                    .from('feature_strategies as fs')
                    .leftJoin('milestones as m', 'm.id', 'fs.milestone_id')
                    .leftJoin('release_plan_definitions as rpd', function () {
                        this.on(
                            'rpd.id',
                            'm.release_plan_definition_id',
                        ).andOnVal('rpd.discriminator', '=', 'plan');
                    })
                    .where(function () {
                        this.whereNull('fs.milestone_id').orWhereRaw(
                            'fs.milestone_id = rpd.active_milestone_id',
                        );
                    })
                    .andWhere(function () {
                        this.whereNull('fs.disabled').orWhere(
                            'fs.disabled',
                            false,
                        );
                    })
                    .groupBy('fs.feature_name', 'fs.environment')
                    .as('enabled_strategies'),
                function () {
                    this.on(
                        'enabled_strategies.feature_name',
                        '=',
                        'ranked_features.feature_name',
                    ).andOn(
                        'enabled_strategies.environment',
                        '=',
                        'ranked_features.environment',
                    );
                },
            )
            .leftJoin(
                this.db
                    .select('fs.feature_name', 'fs.environment')
                    .from('feature_strategies as fs')
                    .leftJoin('milestones as m', 'm.id', 'fs.milestone_id')
                    .leftJoin('release_plan_definitions as rpd', function () {
                        this.on(
                            'rpd.id',
                            'm.release_plan_definition_id',
                        ).andOnVal('rpd.discriminator', '=', 'plan');
                    })
                    .where(function () {
                        this.whereNull('fs.milestone_id').orWhereRaw(
                            'fs.milestone_id = rpd.active_milestone_id',
                        );
                    })
                    .groupBy('fs.feature_name', 'fs.environment')
                    .as('has_strategies'),
                function () {
                    this.on(
                        'has_strategies.feature_name',
                        '=',
                        'ranked_features.feature_name',
                    ).andOn(
                        'has_strategies.environment',
                        '=',
                        'ranked_features.environment',
                    );
                },
            );
    }

    private buildReleasePlanSql(queryBuilder: Knex.QueryBuilder) {
        queryBuilder
            .leftJoin(
                this.db
                    .with('total_milestones', (qb) => {
                        qb.select('release_plan_definition_id')
                            .count('* as total_milestones')
                            .from('milestones')
                            .groupBy('release_plan_definition_id');
                    })
                    .select([
                        'rpd.feature_name',
                        'rpd.environment',
                        'active_milestone.sort_order AS milestone_order',
                        'total_milestones.total_milestones',
                        'active_milestone.name AS milestone_name',
                    ])
                    .from('release_plan_definitions AS rpd')
                    .join(
                        'total_milestones',
                        'total_milestones.release_plan_definition_id',
                        'rpd.id',
                    )
                    .join(
                        'milestones AS active_milestone',
                        'active_milestone.id',
                        'rpd.active_milestone_id',
                    )
                    .where('rpd.discriminator', 'plan')
                    .as('feature_release_plan'),
                function () {
                    this.on(
                        'feature_release_plan.feature_name',
                        '=',
                        'ranked_features.feature_name',
                    ).andOn(
                        'feature_release_plan.environment',
                        '=',
                        'ranked_features.environment',
                    );
                },
            )
            .select([
                'feature_release_plan.milestone_name',
                'feature_release_plan.milestone_order',
                'feature_release_plan.total_milestones',
            ]);
    }

    private buildChangeRequestSql(queryBuilder: Knex.QueryBuilder) {
        queryBuilder
            .leftJoin(
                this.db('change_request_events AS cre')
                    .join(
                        'change_requests AS cr',
                        'cre.change_request_id',
                        'cr.id',
                    )
                    .select('cre.feature')
                    .select(
                        this.db.raw(
                            'array_agg(distinct cre.change_request_id) AS change_request_ids',
                        ),
                    )
                    .select('cr.environment')
                    .groupBy('cre.feature', 'cr.environment')
                    .whereNotIn('cr.state', [
                        'Applied',
                        'Cancelled',
                        'Rejected',
                    ])
                    .as('feature_cr'),
                function () {
                    this.on(
                        'feature_cr.feature',
                        '=',
                        'ranked_features.feature_name',
                    ).andOn(
                        'feature_cr.environment',
                        '=',
                        'ranked_features.environment',
                    );
                },
            )
            .select('feature_cr.change_request_ids');
    }

    private buildRankingSql(
        favoritesFirst: undefined | boolean,
        sortBy: string,
        validatedSortOrder: 'asc' | 'desc',
        lastSeenQuery: string,
    ) {
        const sortByMapping = {
            name: 'features.name',
            type: 'features.type',
            stale: 'features.stale',
            project: 'features.project',
        };

        let rankingSql = 'order by ';
        if (favoritesFirst) {
            rankingSql += 'favorite_features.feature is not null desc, ';
        }

        if (sortBy.startsWith('environment:')) {
            const [, envName] = sortBy.split(':');
            rankingSql += this.db
                .raw(
                    `CASE WHEN feature_environments.environment = ? THEN feature_environments.enabled ELSE NULL END ${validatedSortOrder} NULLS LAST, features.created_at asc, features.name asc`,
                    [envName],
                )
                .toString();
        } else if (sortBy === 'lastSeenAt') {
            rankingSql += `${this.db
                .raw(
                    `coalesce(${lastSeenQuery}, features.last_seen_at) ${validatedSortOrder} nulls last`,
                )
                .toString()}, features.created_at asc, features.name asc`;
        } else if (sortByMapping[sortBy]) {
            rankingSql += `${this.db
                .raw(`?? ${validatedSortOrder}`, [sortByMapping[sortBy]])
                .toString()}, features.created_at asc, features.name asc`;
        } else {
            rankingSql += `features.created_at ${validatedSortOrder}, features.name asc`;
        }
        return rankingSql;
    }

    getAggregatedSearchData(rows): IFeatureSearchOverview[] {
        const entriesMap: Map<string, IFeatureSearchOverview> = new Map();
        const orderedEntries: IFeatureSearchOverview[] = [];

        rows.forEach((row) => {
            let entry = entriesMap.get(row.feature_name);

            if (!entry) {
                // Create a new entry
                const name =
                    row.user_name ||
                    row.user_username ||
                    row.user_email ||
                    'unknown';
                entry = {
                    type: row.type,
                    description: row.description,
                    project: row.project,
                    favorite: row.favorite,
                    name: row.feature_name,
                    createdAt: row.created_at,
                    stale: row.stale,
                    archivedAt: row.archived_at,
                    impressionData: row.impression_data,
                    lastSeenAt: row.last_seen_at,
                    dependencyType: row.dependency,
                    environments: [],
                    segments: row.segment_name ? [row.segment_name] : [],
                    createdBy: {
                        id: Number(row.user_id),
                        name: name,
                        imageUrl: generateImageUrl({
                            id: row.user_id,
                            email: row.user_email,
                            username: name,
                        }),
                    },
                };
                entry.lifecycle = row.latest_stage
                    ? {
                          stage: row.latest_stage,
                          ...(row.stage_status
                              ? { status: row.stage_status }
                              : {}),
                          enteredStageAt: row.entered_stage_at,
                      }
                    : undefined;
                entriesMap.set(row.feature_name, entry);
                orderedEntries.push(entry);
            }

            // Add environment if not already present
            if (!entry.environments.some((e) => e.name === row.environment)) {
                entry.environments.push(FeatureSearchStore.getEnvironment(row));
            }

            // Add segment if not already present
            if (
                row.segment_name &&
                !entry.segments.includes(row.segment_name)
            ) {
                entry.segments.push(row.segment_name);
            }

            // Add tag if new
            if (this.isNewTag(entry, row)) {
                this.addTag(entry, row);
            }

            // Update lastSeenAt if more recent
            if (
                !entry.lastSeenAt ||
                new Date(row.env_last_seen_at) > new Date(entry.lastSeenAt)
            ) {
                entry.lastSeenAt = row.env_last_seen_at;
            }
        });

        return orderedEntries;
    }

    private addTag(
        featureToggle: Record<string, any>,
        row: Record<string, any>,
    ): void {
        const tags = featureToggle.tags || [];
        const newTag = this.rowToTag(row);
        featureToggle.tags = [...tags, newTag];
    }

    private rowToTag(r: any): ITag {
        return {
            value: r.tag_value,
            type: r.tag_type,
            color: r.tag_type_color,
        };
    }

    private isTagRow(row: Record<string, any>): boolean {
        return row.tag_type && row.tag_value;
    }

    private isNewTag(
        featureToggle: Record<string, any>,
        row: Record<string, any>,
    ): boolean {
        return (
            this.isTagRow(row) &&
            !featureToggle.tags?.some(
                (tag) =>
                    tag.type === row.tag_type && tag.value === row.tag_value,
            )
        );
    }
}

const applyStaleConditions = (
    query: Knex.QueryBuilder,
    staleConditions?: IQueryParam,
): void => {
    if (!staleConditions) return;

    const { values, operator } = staleConditions;

    if (!values.includes('potentially-stale')) {
        applyGenericQueryParams(query, [
            {
                ...staleConditions,
                values: values.map((value) =>
                    value === 'active' ? 'false' : 'true',
                ),
            },
        ]);
        return;
    }

    const valueSet = new Set(
        values.filter((value) =>
            ['stale', 'active', 'potentially-stale'].includes(value || ''),
        ),
    );
    const allSelected = valueSet.size === 3;
    const onlyPotentiallyStale = valueSet.size === 1;
    const staleAndPotentiallyStale =
        valueSet.has('stale') && valueSet.size === 2;

    if (allSelected) {
        switch (operator) {
            case 'IS':
            case 'IS_ANY_OF':
                // All flags included; no action needed
                break;
            case 'IS_NOT':
            case 'IS_NONE_OF':
                // All flags excluded
                query.whereNotIn('features.stale', [false, true]);
                break;
        }
        return;
    }

    if (onlyPotentiallyStale) {
        switch (operator) {
            case 'IS':
            case 'IS_ANY_OF':
                query
                    .where('features.stale', false)
                    .where('features.potentially_stale', true);
                break;
            case 'IS_NOT':
            case 'IS_NONE_OF':
                query.where((qb) =>
                    qb
                        .where('features.stale', true)
                        .orWhere('features.potentially_stale', false),
                );
                break;
        }
        return;
    }

    if (staleAndPotentiallyStale) {
        switch (operator) {
            case 'IS':
            case 'IS_ANY_OF':
                query.where((qb) =>
                    qb
                        .where('features.stale', true)
                        .orWhere('features.potentially_stale', true),
                );
                break;
            case 'IS_NOT':
            case 'IS_NONE_OF':
                query
                    .where('features.stale', false)
                    .where('features.potentially_stale', false);
                break;
        }
    } else {
        switch (operator) {
            case 'IS':
            case 'IS_ANY_OF':
                query.where('features.stale', false);
                break;
            case 'IS_NOT':
            case 'IS_NONE_OF':
                query.where('features.stale', true);
                break;
        }
    }
};
const applyLastSeenAtConditions = (
    query: Knex.QueryBuilder,
    lastSeenAtConditions: IQueryParam[],
): void => {
    lastSeenAtConditions.forEach((param) => {
        const lastSeenAtExpression = query.client.raw(
            'coalesce(last_seen_at_metrics.last_seen_at, features.last_seen_at)',
        );

        switch (param.operator) {
            case 'IS_BEFORE':
                query.where(lastSeenAtExpression, '<', param.values[0]);
                break;
            case 'IS_ON_OR_AFTER':
                query.where(lastSeenAtExpression, '>=', param.values[0]);
                break;
        }
    });
};

const applyQueryParams = (
    query: Knex.QueryBuilder,
    queryParams: IQueryParam[],
): void => {
    const tagConditions = queryParams.filter((param) => param.field === 'tag');
    const staleConditions = queryParams.find(
        (param) => param.field === 'stale',
    );
    const segmentConditions = queryParams.filter(
        (param) => param.field === 'segment',
    );
    const lastSeenAtConditions = queryParams.filter(
        (param) => param.field === 'lastSeenAt',
    );
    const genericConditions = queryParams.filter(
        (param) =>
            !['tag', 'stale', 'segment', 'lastSeenAt'].includes(param.field),
    );
    applyGenericQueryParams(query, genericConditions);

    applyStaleConditions(query, staleConditions);
    applyLastSeenAtConditions(query, lastSeenAtConditions);

    applyMultiQueryParams(
        query,
        tagConditions,
        ['tag_type', 'tag_value'],
        createTagBaseQuery,
    );
    applyMultiQueryParams(
        query,
        segmentConditions,
        'segments.name',
        createSegmentBaseQuery,
    );
};

const applyMultiQueryParams = (
    query: Knex.QueryBuilder,
    queryParams: IQueryParam[],
    fields: string | string[],
    createBaseQuery: (
        values: string[] | string[][],
    ) => (dbSubQuery: Knex.QueryBuilder) => Knex.QueryBuilder,
): void => {
    queryParams.forEach((param) => {
        const values = param.values
            .filter((v) => typeof v === 'string')
            .map((val) =>
                (Array.isArray(fields)
                    ? val!.split(/:(.+)/).filter(Boolean)
                    : [val]
                ).map((s) => s?.trim() || ''),
            );
        const baseSubQuery = createBaseQuery(values);

        switch (param.operator) {
            case 'INCLUDE':
            case 'INCLUDE_ANY_OF':
                if (Array.isArray(fields)) {
                    query.whereIn(fields, values);
                } else {
                    query.whereIn(
                        fields,
                        values.map((v) => v[0]),
                    );
                }
                break;

            case 'DO_NOT_INCLUDE':
            case 'EXCLUDE_IF_ANY_OF':
                query.whereNotIn('features.name', baseSubQuery);
                break;

            case 'INCLUDE_ALL_OF':
                query.whereIn('features.name', (dbSubQuery) => {
                    baseSubQuery(dbSubQuery)
                        .groupBy('feature_name')
                        .havingRaw('COUNT(*) = ?', [values.length]);
                });
                break;

            case 'EXCLUDE_ALL':
                query.whereNotIn('features.name', (dbSubQuery) => {
                    baseSubQuery(dbSubQuery)
                        .groupBy('feature_name')
                        .havingRaw('COUNT(*) = ?', [values.length]);
                });
                break;
        }
    });
};

const createTagBaseQuery = (tags: string[][]) => {
    return (dbSubQuery: Knex.QueryBuilder): Knex.QueryBuilder => {
        return dbSubQuery
            .from('feature_tag')
            .select('feature_name')
            .whereIn(['tag_type', 'tag_value'], tags);
    };
};

const createSegmentBaseQuery = (segments: string[]) => {
    return (dbSubQuery: Knex.QueryBuilder): Knex.QueryBuilder => {
        return dbSubQuery
            .from('feature_strategies')
            .leftJoin(
                'feature_strategy_segment',
                'feature_strategy_segment.feature_strategy_id',
                'feature_strategies.id',
            )
            .leftJoin(
                'segments',
                'feature_strategy_segment.segment_id',
                'segments.id',
            )
            .select('feature_name')
            .whereIn('name', segments);
    };
};

export default FeatureSearchStore;
