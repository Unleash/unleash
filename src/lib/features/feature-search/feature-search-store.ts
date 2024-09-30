import { Knex } from 'knex';
import type EventEmitter from 'events';
import metricsHelper from '../../util/metrics-helper';
import { DB_TIME } from '../../metric-events';
import type { Logger, LogProvider } from '../../logger';
import type {
    IFeatureSearchOverview,
    IFeatureSearchStore,
    IFlagResolver,
    ITag,
} from '../../types';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import type { Db } from '../../db/db';
import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { applyGenericQueryParams, applySearchFilters } from './search-utils';
import type { FeatureSearchEnvironmentSchema } from '../../openapi/spec/feature-search-environment-schema';
import { generateImageUrl } from '../../util';
import Raw = Knex.Raw;

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

    private logger: Logger;

    private readonly timer: Function;

    private flagResolver: IFlagResolver;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.logger = getLogger('feature-search-store.ts');
        this.flagResolver = flagResolver;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-search',
                action,
            });
    }

    private static getEnvironment(r: any): FeatureSearchEnvironmentSchema {
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
        };
    }

    private getLatestLifecycleStageQuery() {
        return this.db('feature_lifecycles')
            .select(
                'feature as stage_feature',
                'stage as latest_stage',
                'status as stage_status',
                'created_at as entered_stage_at',
            )
            .distinctOn('stage_feature')
            .orderBy([
                'stage_feature',
                {
                    column: 'entered_stage_at',
                    order: 'desc',
                },
            ]);
    }

    async searchFeatures(
        {
            userId,
            searchParams,
            status,
            offset,
            limit,
            sortOrder,
            sortBy,
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
                    'segments.name as segment_name',
                    'users.id as user_id',
                    'users.name as user_name',
                    'users.username as user_username',
                    'users.email as user_email',
                    'users.image_url as user_image_url',
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
                    .modify(FeatureToggleStore.filterByArchived, false)
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
                    );

                query.leftJoin('last_seen_at_metrics', function () {
                    this.on(
                        'last_seen_at_metrics.environment',
                        '=',
                        'environments.name',
                    ).andOn(
                        'last_seen_at_metrics.feature_name',
                        '=',
                        'features.name',
                    );
                });

                const rankingSql = this.buildRankingSql(
                    favoritesFirst,
                    sortBy,
                    validatedSortOrder,
                    lastSeenQuery,
                );

                query
                    .select(selectColumns)
                    .denseRank('rank', this.db.raw(rankingSql));
            })
            .with('lifecycle', this.getLatestLifecycleStageQuery())
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
        finalQuery
            .select(
                'lifecycle.latest_stage',
                'lifecycle.stage_status',
                'lifecycle.entered_stage_at',
            )
            .leftJoin(
                'lifecycle',
                'ranked_features.feature_name',
                'lifecycle.stage_feature',
            );
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
                    .select('feature_name', 'environment')
                    .from('feature_strategies')
                    .groupBy('feature_name', 'environment')
                    .where(function () {
                        this.whereNull('disabled').orWhere('disabled', false);
                    })
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
                    .select('feature_name', 'environment')
                    .from('feature_strategies')
                    .groupBy('feature_name', 'environment')
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

const applyQueryParams = (
    query: Knex.QueryBuilder,
    queryParams: IQueryParam[],
): void => {
    const tagConditions = queryParams.filter((param) => param.field === 'tag');
    const segmentConditions = queryParams.filter(
        (param) => param.field === 'segment',
    );
    const genericConditions = queryParams.filter(
        (param) => param.field !== 'tag',
    );
    applyGenericQueryParams(query, genericConditions);

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
        const values = param.values.map((val) =>
            (Array.isArray(fields)
                ? val.split(/:(.+)/).filter(Boolean)
                : [val]
            ).map((s) => s.trim()),
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

module.exports = FeatureSearchStore;
export default FeatureSearchStore;
