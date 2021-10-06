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
import { DEFAULT_ENV } from '../util/constants';

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
        if (includeId) {
            return {
                name: r.strategy_name,
                constraints: r.constraints || [],
                parameters: r.parameters,
                id: r.strategy_id,
            };
        } else {
            return {
                name: r.strategy_name,
                constraints: r.constraints || [],
                parameters: r.parameters,
            };
        }
    }

    private async getAll(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
        isAdmin: boolean = true,
    ): Promise<IFeatureToggleClient[]> {
        const environment = featureQuery?.environment || DEFAULT_ENV;
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
                'fe.enabled as enabled',
                'fe.environment as environment',
                'fs.id as strategy_id',
                'fs.strategy_name as strategy_name',
                'fs.parameters as parameters',
                'fs.constraints as constraints',
            )
            .fullOuterJoin(
                this.db('feature_strategies')
                    .select('*')
                    .where({ environment })
                    .as('fs'),
                'fs.feature_name',
                'features.name',
            )
            .fullOuterJoin(
                this.db('feature_environments')
                    .select('feature_name', 'enabled', 'environment')
                    .where({ environment })
                    .as('fe'),
                'fe.feature_name',
                'features.name',
            )
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
