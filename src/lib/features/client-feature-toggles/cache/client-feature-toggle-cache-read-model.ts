import { Knex } from 'knex';

import Raw = Knex.Raw;

import type EventEmitter from 'events';
import { ALL_PROJECTS, ensureStringValue, mapValues } from '../../../util';
import type {
    FeatureConfigurationCacheClient,
    IClientFeatureToggleCacheReadModel,
} from './client-feature-toggle-cache-read-model-type';
import type { Db } from '../../../db/db';
import {
    DB_TIME,
    type IFeatureToggleCacheQuery,
    type IStrategyConfig,
    type PartialDeep,
} from '../../../internals';
import metricsHelper from '../../../util/metrics-helper';
import FeatureToggleStore from '../../feature-toggle/feature-toggle-store';

export default class ClientFeatureToggleCacheReadModel
    implements IClientFeatureToggleCacheReadModel
{
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'client-feature-toggle-cache-read-model',
                action,
            });
    }

    public async getAll(
        featureQuery: IFeatureToggleCacheQuery,
    ): Promise<FeatureConfigurationCacheClient[]> {
        const environment = featureQuery.environment;
        const stopTimer = this.timer(`getAll`);

        const selectColumns = [
            'features.name as name',
            'features.description as description',
            'features.type as type',
            'features.project as project',
            'features.stale as stale',
            'features.impression_data as impression_data',
            'features.created_at as created_at',
            'fe.variants as variants',
            'fe.enabled as enabled',
            'fe.environment as environment',
            'fs.id as strategy_id',
            'fs.strategy_name as strategy_name',
            'fs.title as strategy_title',
            'fs.disabled as strategy_disabled',
            'fs.parameters as parameters',
            'fs.constraints as constraints',
            'fs.sort_order as sort_order',
            'fs.variants as strategy_variants',
            'segments.id as segment_id',
            'segments.constraints as segment_constraints',
            'df.parent as parent',
            'df.variants as parent_variants',
            'df.enabled as parent_enabled',
        ] as (string | Raw<any>)[];

        let query = this.db('features')
            .modify(FeatureToggleStore.filterByArchived, false)
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
            .leftJoin('segments', `segments.id`, `fss.segment_id`)
            .leftJoin('dependent_features as df', 'df.child', 'features.name');

        if (featureQuery?.toggleNames && featureQuery?.toggleNames.length > 0) {
            query = query.whereIn('features.name', featureQuery.toggleNames);
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
            if (
                featureQuery.project &&
                !featureQuery.project.includes(ALL_PROJECTS)
            ) {
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
            const feature: PartialDeep<FeatureConfigurationCacheClient> = acc[
                r.name
            ] ?? {
                strategies: [],
            };
            if (this.isUnseenStrategyRow(feature, r) && !r.strategy_disabled) {
                feature.strategies?.push(this.rowToStrategy(r));
            }
            if (featureQuery?.inlineSegmentConstraints && r.segment_id) {
                this.addSegmentToStrategy(feature, r);
            } else if (
                !featureQuery?.inlineSegmentConstraints &&
                r.segment_id
            ) {
                this.addSegmentIdsToStrategy(feature, r);
            }
            if (r.parent) {
                feature.dependencies = feature.dependencies || [];
                feature.dependencies.push({
                    feature: r.parent,
                    enabled: r.parent_enabled,
                    ...(r.parent_enabled
                        ? { variants: r.parent_variants }
                        : {}),
                });
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

            acc[r.name] = feature;
            return acc;
        }, {});

        const features: FeatureConfigurationCacheClient[] =
            Object.values(featureToggles);

        // strip away unwanted properties
        const cleanedFeatures = features.map(({ strategies, ...rest }) => ({
            ...rest,
            strategies: strategies
                ?.sort((strategy1, strategy2) => {
                    if (
                        typeof strategy1.sortOrder === 'number' &&
                        typeof strategy2.sortOrder === 'number'
                    ) {
                        return strategy1.sortOrder - strategy2.sortOrder;
                    }
                    return 0;
                })
                .map(({ id, title, sortOrder, ...strategy }) => ({
                    ...strategy,
                })),
        }));

        return cleanedFeatures;
    }

    private addSegmentIdsToStrategy(
        feature: PartialDeep<FeatureConfigurationCacheClient>,
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

    private rowToStrategy(row: Record<string, any>): IStrategyConfig {
        const strategy: IStrategyConfig = {
            id: row.strategy_id,
            name: row.strategy_name,
            title: row.strategy_title,
            constraints: row.constraints || [],
            parameters: mapValues(row.parameters || {}, ensureStringValue),
            sortOrder: row.sort_order,
        };
        strategy.variants = row.strategy_variants || [];
        return strategy;
    }

    private isUnseenStrategyRow(
        feature: PartialDeep<FeatureConfigurationCacheClient>,
        row: Record<string, any>,
    ): boolean {
        return (
            row.strategy_id &&
            !feature.strategies?.find((s) => s?.id === row.strategy_id)
        );
    }

    private addSegmentToStrategy(
        feature: PartialDeep<FeatureConfigurationCacheClient>,
        row: Record<string, any>,
    ) {
        feature.strategies
            ?.find((s) => s?.id === row.strategy_id)
            ?.constraints?.push(...row.segment_constraints);
    }
}
