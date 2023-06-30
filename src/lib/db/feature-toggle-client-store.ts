import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import {
    IFeatureToggleClient,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    IStrategyConfig,
    ITag,
    PartialDeep,
} from '../types';
import { DEFAULT_ENV, ensureStringValue, mapValues } from '../util';
import EventEmitter from 'events';
import FeatureToggleStore from './feature-toggle-store';
import { Db } from './db';
import Raw = Knex.Raw;

type OptionalClientFeatures = Set<'strategy IDs' | 'strategy titles'>;

export interface IGetAllFeatures {
    featureQuery?: IFeatureToggleQuery;
    archived: boolean;
    isAdmin: boolean;
    userId?: number;
    optionalIncludes?: OptionalClientFeatures;
}

export interface IGetAdminFeatures {
    featureQuery?: IFeatureToggleQuery;
    archived?: boolean;
    userId?: number;
}

export default class FeatureToggleClientStore
    implements IFeatureToggleClientStore
{
    private db: Db;

    private logger: Logger;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-toggle-client-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    private async getAll({
        featureQuery,
        archived,
        isAdmin,
        userId,
        optionalIncludes,
    }: IGetAllFeatures): Promise<IFeatureToggleClient[]> {
        const environment = featureQuery?.environment || DEFAULT_ENV;
        const stopTimer = this.timer('getFeatureAdmin');

        let selectColumns = [
            'features.name as name',
            'features.description as description',
            'features.type as type',
            'features.project as project',
            'features.stale as stale',
            'features.impression_data as impression_data',
            'fe.variants as variants',
            'features.created_at as created_at',
            'features.last_seen_at as last_seen_at',
            'fe.enabled as enabled',
            'fe.environment as environment',
            'fs.id as strategy_id',
            'fs.strategy_name as strategy_name',
            'fs.title as strategy_title',
            'fs.disabled as strategy_disabled',
            'fs.parameters as parameters',
            'fs.constraints as constraints',
            'segments.id as segment_id',
            'segments.constraints as segment_constraints',
        ] as (string | Raw<any>)[];

        let query = this.db('features')
            .modify(FeatureToggleStore.filterByArchived, archived)
            .leftJoin(
                this.db('feature_strategies')
                    .select('*')
                    .where({ environment })
                    .as('fs'),
                'fs.feature_name',
                'features.name',
            )
            .leftJoin(
                this.db('feature_environments')
                    .select(
                        'feature_name',
                        'enabled',
                        'environment',
                        'variants',
                    )
                    .where({ environment })
                    .as('fe'),
                'fe.feature_name',
                'features.name',
            )
            .leftJoin(
                'feature_strategy_segment as fss',
                `fss.feature_strategy_id`,
                `fs.id`,
            )
            .leftJoin('segments', `segments.id`, `fss.segment_id`);

        if (isAdmin) {
            query = query.leftJoin(
                'feature_tag as ft',
                'ft.feature_name',
                'features.name',
            );
            selectColumns = [
                ...selectColumns,
                'ft.tag_value as tag_value',
                'ft.tag_type as tag_type',
            ];

            if (userId) {
                query = query.leftJoin(`favorite_features`, function () {
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
        }

        query = query.select(selectColumns);

        if (featureQuery) {
            if (featureQuery.tag) {
                const tagQuery = this.db
                    .from('feature_tag')
                    .select('feature_name')
                    .whereIn(['tag_type', 'tag_value'], featureQuery.tag);
                query = query.whereIn('features.name', tagQuery);
            }
            if (featureQuery.project) {
                query = query.whereIn('project', featureQuery.project);
            }
            if (featureQuery.namePrefix) {
                query = query.where(
                    'features.name',
                    'like',
                    `${featureQuery.namePrefix}%`,
                );
            }
        }

        const rows = await query;
        stopTimer();

        const featureToggles = rows.reduce((acc, r) => {
            let feature: PartialDeep<IFeatureToggleClient> = acc[r.name] ?? {
                strategies: [],
            };
            if (this.isUnseenStrategyRow(feature, r) && !r.strategy_disabled) {
                feature.strategies?.push(
                    FeatureToggleClientStore.rowToStrategy(r),
                );
            }
            if (this.isNewTag(feature, r)) {
                this.addTag(feature, r);
            }
            if (featureQuery?.inlineSegmentConstraints && r.segment_id) {
                this.addSegmentToStrategy(feature, r);
            } else if (
                !featureQuery?.inlineSegmentConstraints &&
                r.segment_id
            ) {
                this.addSegmentIdsToStrategy(feature, r);
            }
            feature.impressionData = r.impression_data;
            feature.enabled = !!r.enabled;
            feature.name = r.name;
            feature.description = r.description;
            feature.project = r.project;
            feature.stale = r.stale;
            feature.type = r.type;
            feature.variants = r.variants || [];
            feature.project = r.project;
            if (isAdmin) {
                feature.favorite = r.favorite;
                feature.lastSeenAt = r.last_seen_at;
                feature.createdAt = r.created_at;
            }

            acc[r.name] = feature;
            return acc;
        }, {});

        const features: IFeatureToggleClient[] = Object.values(featureToggles);

        // strip away unwanted properties
        const cleanedFeatures = features.map(({ strategies, ...rest }) => ({
            ...rest,
            strategies: strategies?.map(({ id, title, ...strategy }) => ({
                ...strategy,

                ...(optionalIncludes?.has('strategy titles') && title
                    ? { title }
                    : {}),

                // We should not send strategy IDs from the client API,
                // as this breaks old versions of the Go SDK (at least).
                ...(isAdmin || optionalIncludes?.has('strategy IDs')
                    ? { id }
                    : {}),
            })),
        }));

        return cleanedFeatures;
    }

    private static rowToStrategy(row: Record<string, any>): IStrategyConfig {
        return {
            id: row.strategy_id,
            name: row.strategy_name,
            title: row.strategy_title,
            constraints: row.constraints || [],
            parameters: mapValues(row.parameters || {}, ensureStringValue),
        };
    }

    private static rowToTag(row: Record<string, any>): ITag {
        return {
            value: row.tag_value,
            type: row.tag_type,
        };
    }

    private isUnseenStrategyRow(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ): boolean {
        return (
            row.strategy_id &&
            !feature.strategies?.find((s) => s?.id === row.strategy_id)
        );
    }

    private addTag(
        feature: Record<string, any>,
        row: Record<string, any>,
    ): void {
        const tags = feature.tags || [];
        const newTag = FeatureToggleClientStore.rowToTag(row);
        feature.tags = [...tags, newTag];
    }

    private isNewTag(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ): boolean {
        return (
            row.tag_type &&
            row.tag_value &&
            !feature.tags?.some(
                (tag) =>
                    tag?.type === row.tag_type && tag?.value === row.tag_value,
            )
        );
    }

    private addSegmentToStrategy(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ) {
        feature.strategies
            ?.find((s) => s?.id === row.strategy_id)
            ?.constraints?.push(...row.segment_constraints);
    }

    private addSegmentIdsToStrategy(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ) {
        const strategy = feature.strategies?.find(
            (s) => s?.id === row.strategy_id,
        );
        if (!strategy) {
            return;
        }
        if (!strategy.segments) {
            strategy.segments = [];
        }
        strategy.segments.push(row.segment_id);
    }

    async getClient(
        featureQuery?: IFeatureToggleQuery,
    ): Promise<IFeatureToggleClient[]> {
        return this.getAll({
            featureQuery,
            archived: false,
            isAdmin: false,
        });
    }

    async getPlayground(
        featureQuery?: IFeatureToggleQuery,
    ): Promise<IFeatureToggleClient[]> {
        return this.getAll({
            featureQuery,
            archived: false,
            isAdmin: false,
            optionalIncludes: new Set(['strategy titles', 'strategy IDs']),
        });
    }

    async getAdmin({
        featureQuery,
        userId,
        archived,
    }: IGetAdminFeatures): Promise<IFeatureToggleClient[]> {
        return this.getAll({
            featureQuery,
            archived: Boolean(archived),
            isAdmin: true,
            userId,
        });
    }
}

module.exports = FeatureToggleClientStore;
