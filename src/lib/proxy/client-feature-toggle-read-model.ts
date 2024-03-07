import { Knex } from 'knex';
import {
    IFeatureToggleClient,
    IFeatureToggleQuery,
    IStrategyConfig,
    ITag,
    PartialDeep,
} from '../types';
import { ensureStringValue, mapValues } from '../util';
import { Db } from '../db/db';
import FeatureToggleStore from '../features/feature-toggle/feature-toggle-store';
import Raw = Knex.Raw;
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import EventEmitter from 'events';

export interface IGetAllFeatures {
    featureQuery?: IFeatureToggleQuery;
    archived: boolean;
    userId?: number;
}

export default class ClientFeatureToggleReadModel {
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'client-feature-toggle-read-model',
                action,
            });
    }

    private async getAll(): Promise<Record<string, IFeatureToggleClient[]>> {
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
                this.db('feature_environments')
                    .select(
                        'feature_name',
                        'enabled',
                        'environment',
                        'variants',
                    )
                    .as('fe'),
                'fe.feature_name',
                'features.name',
            )
            .leftJoin('feature_strategies as fs', function () {
                this.on('fs.feature_name', '=', 'features.name').andOn(
                    'fs.environment',
                    '=',
                    'fe.environment',
                );
            })
            .leftJoin(
                'feature_strategy_segment as fss',
                `fss.feature_strategy_id`,
                `fs.id`,
            )
            .leftJoin('segments', `segments.id`, `fss.segment_id`)
            .leftJoin('dependent_features as df', 'df.child', 'features.name');

        query = query.select(selectColumns);
        const rows = await query;
        stopTimer();

        const data = this.getAggregatedData(rows);
        return data;
    }

    getAggregatedData(rows): Record<string, IFeatureToggleClient[]> {
        const featureTogglesByEnv: Record<string, IFeatureToggleClient[]> = {};

        rows.forEach((row) => {
            const environment = row.environment;

            if (!featureTogglesByEnv[environment]) {
                featureTogglesByEnv[environment] = [];
            }

            let feature = featureTogglesByEnv[environment].find(
                (f) => f.name === row.name,
            );

            if (!feature) {
                feature = {
                    name: row.name,
                    strategies: [],
                    variants: row.variants || [],
                    impressionData: row.impression_data,
                    enabled: !!row.enabled,
                    description: row.description,
                    project: row.project,
                    stale: row.stale,
                    type: row.type,
                };
                featureTogglesByEnv[environment].push(feature);
            } else {
                if (this.isNewTag(feature, row)) {
                    this.addTag(feature, row);
                }
            }
            if (row.parent) {
                feature.dependencies = feature.dependencies || [];
                feature.dependencies.push({
                    feature: row.parent,
                    enabled: row.parent_enabled,
                    ...(row.parent_enabled
                        ? { variants: row.parent_variants }
                        : {}),
                });
            }

            if (
                this.isUnseenStrategyRow(feature, row) &&
                !row.strategy_disabled
            ) {
                feature.strategies?.push(this.rowToStrategy(row));
            }
        });
        Object.keys(featureTogglesByEnv).forEach((envKey) => {
            featureTogglesByEnv[envKey] = featureTogglesByEnv[envKey].map(
                (featureToggle) => ({
                    ...featureToggle,
                    strategies: featureToggle.strategies
                        ?.sort((strategy1, strategy2) => {
                            if (
                                typeof strategy1.sortOrder === 'number' &&
                                typeof strategy2.sortOrder === 'number'
                            ) {
                                return (
                                    strategy1.sortOrder - strategy2.sortOrder
                                );
                            }
                            return 0;
                        })
                        .map(({ id, title, sortOrder, ...strategy }) => ({
                            ...strategy,
                        })),
                }),
            );
        });

        return featureTogglesByEnv;
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
        const newTag = ClientFeatureToggleReadModel.rowToTag(row);
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

    async getClient(): Promise<Record<string, IFeatureToggleClient[]>> {
        return this.getAll();
    }
}
