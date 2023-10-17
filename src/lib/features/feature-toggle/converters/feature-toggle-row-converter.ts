import {
    PartialDeep,
    IFeatureToggleClient,
    IStrategyConfig,
    FeatureToggle,
    IFeatureToggleQuery,
    ITag,
} from '../../../types';

import { mapValues, ensureStringValue } from '../../../util';
import { FeatureConfigurationClient } from '../types/feature-toggle-strategies-store-type';

export class FeatureToggleRowConverter {
    isUnseenStrategyRow = (
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ): boolean => {
        return (
            row.strategy_id &&
            !feature.strategies?.find(
                (strategy) => strategy?.id === row.strategy_id,
            )
        );
    };

    isNewTag = (
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ): boolean => {
        return (
            row.tag_type &&
            row.tag_value &&
            !feature.tags?.some(
                (tag) =>
                    tag?.type === row.tag_type && tag?.value === row.tag_value,
            )
        );
    };

    addSegmentToStrategy = (
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ) => {
        feature.strategies
            ?.find((strategy) => strategy?.id === row.strategy_id)
            ?.constraints?.push(...row.segment_constraints);
    };

    addSegmentIdsToStrategy = (
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ) => {
        const strategy = feature.strategies?.find(
            (strategy) => strategy?.id === row.strategy_id,
        );
        if (!strategy) {
            return;
        }
        if (!strategy.segments) {
            strategy.segments = [];
        }
        strategy.segments.push(row.segment_id);
    };

    rowToStrategy = (row: Record<string, any>): IStrategyConfig => {
        const strategy: IStrategyConfig = {
            id: row.strategy_id,
            name: row.strategy_name,
            title: row.strategy_title,
            constraints: row.constraints || [],
            parameters: mapValues(row.parameters || {}, ensureStringValue),
            sortOrder: row.sort_order,
            disabled: row.strategy_disabled,
        };
        strategy.variants = row.strategy_variants || [];
        return strategy;
    };

    addTag = (feature: Record<string, any>, row: Record<string, any>): void => {
        const tags = feature.tags || [];
        const newTag = this.rowToTag(row);
        feature.tags = [...tags, newTag];
    };

    rowToTag = (row: Record<string, any>): ITag => {
        return {
            value: row.tag_value,
            type: row.tag_type,
        };
    };

    formatToggles = (result: IFeatureToggleQuery) =>
        Object.values(result).map(({ strategies, ...rest }) => ({
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
                .map(({ title, sortOrder, ...strategy }) => ({
                    ...strategy,
                    ...(title ? { title } : {}),
                })),
        }));

    createBaseFeature = (
        row: any,
        feature: PartialDeep<IFeatureToggleClient>,
        featureQuery?: IFeatureToggleQuery,
    ) => {
        feature.impressionData = row.impression_data;
        feature.enabled = !!row.enabled;
        feature.name = row.name;
        feature.description = row.description;
        feature.project = row.project;
        feature.stale = row.stale;
        feature.type = row.type;
        feature.lastSeenAt = row.last_seen_at;
        feature.variants = row.variants || [];
        feature.project = row.project;

        if (this.isUnseenStrategyRow(feature, row) && !row.strategy_disabled) {
            feature.strategies?.push(this.rowToStrategy(row));
        }
        if (this.isNewTag(feature, row)) {
            this.addTag(feature, row);
        }
        if (featureQuery?.inlineSegmentConstraints && row.segment_id) {
            this.addSegmentToStrategy(feature, row);
        } else if (!featureQuery?.inlineSegmentConstraints && row.segment_id) {
            this.addSegmentIdsToStrategy(feature, row);
        }

        return feature;
    };

    buildFeatureToggleListFromRows = (
        rows: any[],
        featureQuery?: IFeatureToggleQuery,
        includeDisabledStrategies?: boolean,
    ): FeatureToggle[] => {
        const result = rows.reduce((acc, r) => {
            let feature: PartialDeep<IFeatureToggleClient> = acc[r.name] ?? {
                strategies: [],
            };

            feature = this.createBaseFeature(r, feature, featureQuery);

            if (
                this.isUnseenStrategyRow(feature, r) &&
                includeDisabledStrategies &&
                r.strategy_disabled
            ) {
                feature.strategies?.push(this.rowToStrategy(r));
            }

            feature.createdAt = r.created_at;
            feature.favorite = r.favorite;

            acc[r.name] = feature;
            return acc;
        }, {});

        return this.formatToggles(result);
    };

    buildPlaygroundFeaturesFromRows = (
        rows: any[],
        dependentFeaturesEnabled: boolean,
        includeDisabledStrategies: boolean,
        featureQuery?: IFeatureToggleQuery,
    ): FeatureConfigurationClient[] => {
        const result = rows.reduce((acc, r) => {
            let feature: PartialDeep<IFeatureToggleClient> = acc[r.name] ?? {
                strategies: [],
            };

            feature = this.createBaseFeature(r, feature, featureQuery);

            if (
                this.isUnseenStrategyRow(feature, r) &&
                includeDisabledStrategies &&
                r.strategy_disabled
            ) {
                feature.strategies?.push(this.rowToStrategy(r));
            }

            if (r.parent && dependentFeaturesEnabled) {
                feature.dependencies = feature.dependencies || [];
                feature.dependencies.push({
                    feature: r.parent,
                    enabled: r.parent_enabled,
                    ...(r.parent_enabled
                        ? { variants: r.parent_variants }
                        : {}),
                });
            }

            acc[r.name] = feature;
            return acc;
        }, {});

        return this.formatToggles(result);
    };
}
