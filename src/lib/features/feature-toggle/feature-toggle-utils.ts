import {
    PartialDeep,
    IFeatureToggleClient,
    IStrategyConfig,
    ITag,
    IFeatureToggleQuery,
    FeatureToggle,
} from '../../types';
import { mapValues, ensureStringValue } from '../../util';
import { FeatureConfigurationClient } from './types/feature-toggle-strategies-store-type';

const isUnseenStrategyRow = (
    feature: PartialDeep<IFeatureToggleClient>,
    row: Record<string, any>,
): boolean => {
    return (
        row.strategy_id &&
        !feature.strategies?.find((s) => s?.id === row.strategy_id)
    );
};

const isNewTag = (
    feature: PartialDeep<IFeatureToggleClient>,
    row: Record<string, any>,
): boolean => {
    return (
        row.tag_type &&
        row.tag_value &&
        !feature.tags?.some(
            (tag) => tag?.type === row.tag_type && tag?.value === row.tag_value,
        )
    );
};

const addSegmentToStrategy = (
    feature: PartialDeep<IFeatureToggleClient>,
    row: Record<string, any>,
) => {
    feature.strategies
        ?.find((s) => s?.id === row.strategy_id)
        ?.constraints?.push(...row.segment_constraints);
};

const addSegmentIdsToStrategy = (
    feature: PartialDeep<IFeatureToggleClient>,
    row: Record<string, any>,
) => {
    const strategy = feature.strategies?.find((s) => s?.id === row.strategy_id);
    if (!strategy) {
        return;
    }
    if (!strategy.segments) {
        strategy.segments = [];
    }
    strategy.segments.push(row.segment_id);
};

const rowToStrategy = (row: Record<string, any>): IStrategyConfig => {
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
};

const addTag = (
    feature: Record<string, any>,
    row: Record<string, any>,
): void => {
    const tags = feature.tags || [];
    const newTag = rowToTag(row);
    feature.tags = [...tags, newTag];
};

const rowToTag = (row: Record<string, any>): ITag => {
    return {
        value: row.tag_value,
        type: row.tag_type,
    };
};

export const buildFeatureToggleListFromRows = (
    rows: any[],
    featureQuery?: IFeatureToggleQuery,
): FeatureToggle[] => {
    let result = rows.reduce((acc, r) => {
        const feature: PartialDeep<IFeatureToggleClient> = acc[r.name] ?? {
            strategies: [],
        };
        if (isUnseenStrategyRow(feature, r) && !r.strategy_disabled) {
            feature.strategies?.push(rowToStrategy(r));
        }
        if (isNewTag(feature, r)) {
            addTag(feature, r);
        }
        if (featureQuery?.inlineSegmentConstraints && r.segment_id) {
            addSegmentToStrategy(feature, r);
        } else if (!featureQuery?.inlineSegmentConstraints && r.segment_id) {
            addSegmentIdsToStrategy(feature, r);
        }

        feature.impressionData = r.impression_data;
        feature.enabled = !!r.enabled;
        feature.name = r.name;
        feature.description = r.description;
        feature.project = r.project;
        feature.stale = r.stale;
        feature.type = r.type;
        feature.lastSeenAt = r.last_seen_at;
        feature.variants = r.variants || [];
        feature.project = r.project;
        feature.createdAt = r.created_at;
        feature.favorite = r.favorite;

        feature.lastSeenAt = r.last_seen_at;

        acc[r.name] = feature;
        return acc;
    }, {});

    result = Object.values(result).map(({ strategies, ...rest }) => ({
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

    return result;
};

export const buildPlaygroundFeaturesFromRows = (
    rows: any[],
    dependentFeaturesEnabled: boolean,
    featureQuery?: IFeatureToggleQuery,
): FeatureConfigurationClient[] => {
    let result = rows.reduce((acc, r) => {
        const feature: PartialDeep<IFeatureToggleClient> = acc[r.name] ?? {
            strategies: [],
        };
        if (isUnseenStrategyRow(feature, r) && !r.strategy_disabled) {
            feature.strategies?.push(rowToStrategy(r));
        }
        if (isNewTag(feature, r)) {
            addTag(feature, r);
        }
        if (featureQuery?.inlineSegmentConstraints && r.segment_id) {
            addSegmentToStrategy(feature, r);
        } else if (!featureQuery?.inlineSegmentConstraints && r.segment_id) {
            addSegmentIdsToStrategy(feature, r);
        }

        feature.impressionData = r.impression_data;
        feature.enabled = !!r.enabled;
        feature.name = r.name;
        feature.description = r.description;
        feature.project = r.project;
        feature.stale = r.stale;
        feature.type = r.type;
        feature.lastSeenAt = r.last_seen_at;
        feature.variants = r.variants || [];
        feature.project = r.project;
        feature.lastSeenAt = r.last_seen_at;

        if (r.parent && dependentFeaturesEnabled) {
            feature.dependencies = feature.dependencies || [];
            feature.dependencies.push({
                feature: r.parent,
                enabled: r.parent_enabled,
                ...(r.parent_enabled ? { variants: r.parent_variants } : {}),
            });
        }

        acc[r.name] = feature;
        return acc;
    }, {});

    result = Object.values(result).map(({ strategies, ...rest }) => ({
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

    return result;
};

interface Difference {
    index: (string | number)[];
    reason: string;
    valueA: any;
    valueB: any;
}

export function deepDiff(arr1: any[], arr2: any[]): Difference[] | null {
    const diff: Difference[] = [];

    function compare(a: any, b: any, parentIndex: (string | number)[]): void {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                diff.push({
                    index: parentIndex,
                    reason: 'Different lengths',
                    valueA: a,
                    valueB: b,
                });
            } else {
                for (let i = 0; i < a.length; i++) {
                    compare(a[i], b[i], parentIndex.concat(i));
                }
            }
        } else if (
            typeof a === 'object' &&
            a !== null &&
            typeof b === 'object' &&
            b !== null
        ) {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            if (!arraysEqual(keysA, keysB)) {
                diff.push({
                    index: parentIndex,
                    reason: 'Different keys',
                    valueA: a,
                    valueB: b,
                });
            } else {
                for (const key of keysA) {
                    compare(a[key], b[key], parentIndex.concat(key));
                }
            }
        } else if (a !== b) {
            diff.push({
                index: parentIndex,
                reason: 'Different values',
                valueA: a,
                valueB: b,
            });
        }
    }

    function arraysEqual(a: any[], b: any[]): boolean {
        return (
            a.length === b.length &&
            a.sort().every((val, index) => val === b.sort()[index])
        );
    }

    compare(arr1, arr2, []);

    return diff.length > 0 ? diff : null;
}
