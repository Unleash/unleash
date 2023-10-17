import { Knex } from "knex";
import FeatureToggleStore from "../feature-toggle-store";

export class FeatureToggleListBuilder {
    private db: Knex;

    public internalQuery: Knex.QueryBuilder;

    private selectColumns: (string | Knex.Raw<any>)[];

    constructor(db) {
        this.db = db;
        this.selectColumns = [
            'features.name as name',
            'features.description as description',
            'features.type as type',
            'features.project as project',
            'features.stale as stale',
            'features.impression_data as impression_data',
            'features.last_seen_at as last_seen_at',
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
        ] as (string | Knex.Raw<any>)[];
    }

    getSelectColumns = () => {
        return this.selectColumns;
    }

    query = (table: string) => {
        this.internalQuery = this.db(table);

        return this;
    }

    addSelectColumn = (column: string | Knex.Raw<any>) => {
        this.selectColumns.push(column);
    }

    withArchived = (includeArchived: boolean) => {
        this.internalQuery.modify(FeatureToggleStore.filterByArchived, includeArchived)

        return this;
    }

    withStrategies = (filter: string) => {
           this.internalQuery.leftJoin(
                this.db('feature_strategies')
                    .select('*')
                    .where({ environment: filter })
                    .as('fs'),
                'fs.feature_name',
                'features.name',
            )

            return this;
    }

    withFeatureEnvironments = (filter: string) => {
         this.internalQuery.leftJoin(
                this.db('feature_environments')
                    .select(
                        'feature_name',
                        'enabled',
                        'environment',
                        'variants',
                        'last_seen_at',
                    )
                    .where({ environment: filter })
                    .as('fe'),
                'fe.feature_name',
                'features.name',
            )

            return this;
    }

    withFeatureStrategySegments = () => {
          this.internalQuery.leftJoin(
                'feature_strategy_segment as fss',
                `fss.feature_strategy_id`,
                `fs.id`,
            )

            return this;
        }

    withSegments = () => {
        this.internalQuery.leftJoin('segments', `segments.id`, `fss.segment_id`)

        return this;
    }

    withDependentFeatureToggles = () => {
        this.internalQuery.leftJoin('dependent_features as df', 'df.child', 'features.name')

        return this;
    }

    withFeatureTags = () => {
        this.internalQuery.leftJoin('feature_tag as ft', 'ft.feature_name', 'features.name');

        return this;
    }

    withLastSeenByEnvironment = () => {
        this.internalQuery.leftJoin('last_seen_at_metrics', 'last_seen_at_metrics.feature_name', 'features.name');

        return this;
    }

    withFavorites = (userId: number) => {
        this.internalQuery.leftJoin(`favorite_features`, function () {
            this.on('favorite_features.feature', 'features.name').andOnVal(
                'favorite_features.user_id',
                '=',
                userId,
            );
        });
        
        return this;
    }
}