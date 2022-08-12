import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import {
    IFeatureToggleClient,
    IFeatureToggleQuery,
    IStrategyConfig,
} from '../types/model';
import { IFeatureToggleClientStore } from '../types/stores/feature-toggle-client-store';
import { DEFAULT_ENV } from '../util/constants';
import { PartialDeep } from '../types/partial';
import EventEmitter from 'events';
import FeatureToggleStore from './feature-toggle-store';
import { ensureStringValue } from '../util/ensureStringValue';
import { mapValues } from '../util/map-values';

export interface FeaturesTable {
    name: string;
    description: string;
    type: string;
    stale: boolean;
    variants: string;
    project: string;
    last_seen_at?: Date;
    created_at?: Date;
}

export default class FeatureToggleClientStore
    implements IFeatureToggleClientStore
{
    private db: Knex;

    private logger: Logger;

    private inlineSegmentConstraints: boolean;

    private timer: Function;

    constructor(
        db: Knex,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        inlineSegmentConstraints: boolean,
    ) {
        this.db = db;
        this.logger = getLogger('feature-toggle-client-store.ts');
        this.inlineSegmentConstraints = inlineSegmentConstraints;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    private async getAll(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
        isAdmin: boolean = true,
        includeStrategyIds?: boolean,
    ): Promise<IFeatureToggleClient[]> {
        const environment = featureQuery?.environment || DEFAULT_ENV;
        const stopTimer = this.timer('getFeatureAdmin');

        let selectColumns = [
            'features.name as name',
            'features.description as description',
            'features.type as type',
            'features.project as project',
            'features.stale as stale',
            'features.impression_data as impression_data',
            'features.variants as variants',
            'features.created_at as created_at',
            'features.last_seen_at as last_seen_at',
            'fe.enabled as enabled',
            'fe.environment as environment',
            'fs.id as strategy_id',
            'fs.strategy_name as strategy_name',
            'fs.parameters as parameters',
            'fs.constraints as constraints',
            'segments.id as segment_id',
            'segments.constraints as segment_constraints',
        ];

        let query = this.db('features')
            .select(selectColumns)
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
                    .select('feature_name', 'enabled', 'environment')
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
            if (this.isUnseenStrategyRow(feature, r)) {
                feature.strategies.push(
                    FeatureToggleClientStore.rowToStrategy(r),
                );
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
            feature.variants = r.variants;
            feature.project = r.project;
            if (isAdmin) {
                feature.lastSeenAt = r.last_seen_at;
                feature.createdAt = r.created_at;
            }
            acc[r.name] = feature;
            return acc;
        }, {});

        const features: IFeatureToggleClient[] = Object.values(featureToggles);

        if (!isAdmin && !includeStrategyIds) {
            // We should not send strategy IDs from the client API,
            // as this breaks old versions of the Go SDK (at least).
            FeatureToggleClientStore.removeIdsFromStrategies(features);
        }

        return features;
    }

    private static rowToStrategy(row: Record<string, any>): IStrategyConfig {
        return {
            id: row.strategy_id,
            name: row.strategy_name,
            constraints: row.constraints || [],
            parameters: mapValues(row.parameters || {}, ensureStringValue),
        };
    }

    private static removeIdsFromStrategies(features: IFeatureToggleClient[]) {
        features.forEach((feature) => {
            feature.strategies.forEach((strategy) => {
                delete strategy.id;
            });
        });
    }

    private isUnseenStrategyRow(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ): boolean {
        return (
            row.strategy_id &&
            !feature.strategies.find((s) => s.id === row.strategy_id)
        );
    }

    private addSegmentToStrategy(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ) {
        feature.strategies
            .find((s) => s.id === row.strategy_id)
            ?.constraints.push(...row.segment_constraints);
    }

    private addSegmentIdsToStrategy(
        feature: PartialDeep<IFeatureToggleClient>,
        row: Record<string, any>,
    ) {
        const strategy = feature.strategies.find(
            (s) => s.id === row.strategy_id,
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
        includeStrategyIds?: boolean,
    ): Promise<IFeatureToggleClient[]> {
        return this.getAll(featureQuery, false, false, includeStrategyIds);
    }

    async getAdmin(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<IFeatureToggleClient[]> {
        return this.getAll(featureQuery, archived, true);
    }
}

module.exports = FeatureToggleClientStore;
