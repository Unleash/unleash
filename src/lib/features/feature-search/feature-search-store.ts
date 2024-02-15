import { Knex } from 'knex';
import EventEmitter from 'events';
import metricsHelper from '../../util/metrics-helper';
import { DB_TIME } from '../../metric-events';
import { Logger, LogProvider } from '../../logger';
import {
    IEnvironmentOverview,
    IFeatureOverview,
    IFeatureSearchStore,
    ITag,
} from '../../types';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import { Db } from '../../db/db';
import Raw = Knex.Raw;
import {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { applyGenericQueryParams, applySearchFilters } from './search-utils';

const sortEnvironments = (overview: IFeatureOverview[]) => {
    return overview.map((data: IFeatureOverview) => ({
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

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-search-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-search',
                action,
            });
    }

    private static getEnvironment(r: any): IEnvironmentOverview {
        return {
            name: r.environment,
            enabled: r.enabled,
            type: r.environment_type,
            sortOrder: r.environment_sort_order,
            variantCount: r.variants?.length || 0,
            lastSeenAt: r.env_last_seen_at,
            hasStrategies: r.has_strategies,
            hasEnabledStrategies: r.has_enabled_strategies,
        };
    }

    async searchFeatures(
        {
            userId,
            searchParams,
            type,
            status,
            offset,
            limit,
            sortOrder,
            sortBy,
            favoritesFirst,
        }: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{
        features: IFeatureOverview[];
        total: number;
    }> {
        const stopTimer = this.timer('searchFeatures');
        const validatedSortOrder =
            sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'asc';

        const finalQuery = this.db
            .with('ranked_features', (query) => {
                query.from('features');

                applyQueryParams(query, queryParams);
                applySearchFilters(query, searchParams, [
                    'features.name',
                    'features.description',
                ]);

                if (type) {
                    query.whereIn('features.type', type);
                }

                if (status && status.length > 0) {
                    query.where((builder) => {
                        for (const [envName, envStatus] of status) {
                            builder.orWhere(function () {
                                this.where(
                                    'feature_environments.environment',
                                    envName,
                                ).andWhere(
                                    'feature_environments.enabled',
                                    envStatus === 'enabled' ? true : false,
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
                    this.db.raw(
                        'EXISTS (SELECT 1 FROM feature_strategies WHERE feature_strategies.feature_name = features.name AND feature_strategies.environment = feature_environments.environment) as has_strategies',
                    ),
                    this.db.raw(
                        'EXISTS (SELECT 1 FROM feature_strategies WHERE feature_strategies.feature_name = features.name AND feature_strategies.environment = feature_environments.environment AND (feature_strategies.disabled IS NULL OR feature_strategies.disabled = false)) as has_enabled_strategies',
                    ),
                ];

                const sortByMapping = {
                    name: 'features.name',
                    type: 'features.type',
                    stale: 'features.stale',
                    project: 'features.project',
                };

                let rankingSql = 'order by ';
                if (favoritesFirst) {
                    rankingSql +=
                        'favorite_features.feature is not null desc, ';
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
                        .raw(`?? ${validatedSortOrder}`, [
                            sortByMapping[sortBy],
                        ])
                        .toString()}, features.created_at asc, features.name asc`;
                } else {
                    rankingSql += `features.created_at ${validatedSortOrder}, features.name asc`;
                }

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
            .select('*')
            .from('ranked_features')
            .innerJoin(
                'final_ranks',
                'ranked_features.feature_name',
                'final_ranks.feature_name',
            )
            .joinRaw('CROSS JOIN total_features')
            .whereBetween('final_rank', [offset + 1, offset + limit]);
        const rows = await finalQuery;
        stopTimer();
        if (rows.length > 0) {
            const overview = this.getAggregatedSearchData(rows);
            const features = sortEnvironments(overview);
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

    getAggregatedSearchData(rows): IFeatureOverview[] {
        const entriesMap: Map<string, IFeatureOverview> = new Map();
        const orderedEntries: IFeatureOverview[] = [];

        rows.forEach((row) => {
            let entry = entriesMap.get(row.feature_name);

            if (!entry) {
                // Create a new entry
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
                    environments: [],
                    segments: row.segment_name ? [row.segment_name] : [],
                };
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
            (Array.isArray(fields) ? val.split(':') : [val]).map((s) =>
                s.trim(),
            ),
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
