import { Knex } from 'knex';
import EventEmitter from 'events';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import {
    IFeatureToggleClient,
    IFeatureToggleQuery,
    IStrategyConfig,
} from '../types/model';
import { IFeatureToggleClientStore } from '../types/stores/feature-toggle-client-store';

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

    private timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-toggle-client-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });
    }

    private getAdminStrategy(
        r: any,
        includeId: boolean = true,
    ): IStrategyConfig {
        const strategy = {
            name: r.strategy_name,
            constraints: r.constraints || [],
            parameters: r.parameters,
            id: r.strategy_id,
        };
        if (!includeId) {
            delete strategy.id;
        }
        return strategy;
    }

    private async getAll(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
        isAdmin: boolean = true,
    ): Promise<IFeatureToggleClient[]> {
        const environments = [':global:'];
        if (featureQuery?.environment) {
            environments.push(featureQuery.environment);
        }
        const stopTimer = this.timer('getFeatureAdmin');
        let query = this.db('features')
            .select(
                'features.name as name',
                'features.description as description',
                'features.type as type',
                'features.project as project',
                'features.stale as stale',
                'features.variants as variants',
                'features.created_at as created_at',
                'features.last_seen_at as last_seen_at',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'feature_strategies.id as strategy_id',
                'feature_strategies.strategy_name as strategy_name',
                'feature_strategies.parameters as parameters',
                'feature_strategies.constraints as constraints',
            )
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                'features.name',
            )
            .fullOuterJoin('feature_strategies', function () {
                this.on(
                    'feature_strategies.feature_name',
                    'features.name',
                ).andOn(
                    'feature_strategies.environment',
                    'feature_environments.environment',
                );
            })
            .whereIn('feature_environments.environment', environments)
            .where({ archived });
        if (featureQuery) {
            if (featureQuery.tag) {
                const tagQuery = this.db
                    .from('feature_tag')
                    .select('feature_name')
                    .whereIn(['tag_type', 'tag_value'], featureQuery.tag);
                query = query.whereIn('name', tagQuery);
            }
            if (featureQuery.project) {
                query = query.whereIn('project', featureQuery.project);
            }
            if (featureQuery.namePrefix) {
                query = query.where(
                    'name',
                    'like',
                    `${featureQuery.namePrefix}%`,
                );
            }
        }
        const rows = await query;
        stopTimer();
        const featureToggles = rows.reduce((acc, r) => {
            let feature;
            if (acc[r.name]) {
                feature = acc[r.name];
            } else {
                feature = {};
            }
            if (!feature.strategies) {
                feature.strategies = [];
            }
            if (r.strategy_name) {
                feature.strategies.push(this.getAdminStrategy(r, isAdmin));
            }
            if (feature.enabled === undefined) {
                feature.enabled = r.enabled;
            } else {
                feature.enabled = feature.enabled && r.enabled;
            }
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
        return Object.values(featureToggles);
    }

    async getClient(
        featureQuery?: IFeatureToggleQuery,
    ): Promise<IFeatureToggleClient[]> {
        return this.getAll(featureQuery, false, false);
    }

    async getAdmin(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
    ): Promise<IFeatureToggleClient[]> {
        return this.getAll(featureQuery, archived, true);
    }
}

module.exports = FeatureToggleClientStore;
