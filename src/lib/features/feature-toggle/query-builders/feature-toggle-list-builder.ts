import type { Knex } from 'knex';
import FeatureToggleStore from '../feature-toggle-store.js';

export class FeatureToggleListBuilder {
    private db: Knex;

    public internalQuery: Knex.QueryBuilder;

    private selectColumns: (string | Knex.Raw<any>)[];

    constructor(db, selectColumns) {
        this.db = db;
        this.selectColumns = selectColumns;
    }

    getSelectColumns = () => {
        return this.selectColumns;
    };

    query = (table: string) => {
        this.internalQuery = this.db(table);

        return this;
    };

    addSelectColumn = (column: string | Knex.Raw<any>) => {
        this.selectColumns.push(column);
    };

    withArchived = (includeArchived: boolean) => {
        this.internalQuery.modify(
            FeatureToggleStore.filterByArchived,
            includeArchived,
        );

        return this;
    };

    withStrategies = (filter: string) => {
        this.internalQuery.leftJoin(
            this.db('feature_strategies')
                .select('*')
                .where({ environment: filter })
                .as('fs'),
            'fs.feature_name',
            'features.name',
        );

        return this;
    };

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
        );

        return this;
    };

    withFeatureStrategySegments = () => {
        this.internalQuery.leftJoin(
            'feature_strategy_segment as fss',
            `fss.feature_strategy_id`,
            `fs.id`,
        );

        return this;
    };

    withSegments = () => {
        this.internalQuery.leftJoin(
            'segments',
            `segments.id`,
            `fss.segment_id`,
        );

        return this;
    };

    withDependentFeatureToggles = () => {
        this.internalQuery.leftJoin(
            'dependent_features as df',
            'df.child',
            'features.name',
        );

        return this;
    };

    withFeatureTags = () => {
        this.internalQuery.leftJoin(
            'feature_tag as ft',
            'ft.feature_name',
            'features.name',
        );

        return this;
    };

    withLastSeenByEnvironment = (archived = false) => {
        if (archived) {
            this.internalQuery.leftJoin('last_seen_at_metrics', function () {
                this.on(
                    'last_seen_at_metrics.feature_name',
                    '=',
                    'features.name',
                ).andOnNotNull('features.archived_at');
            });
        } else {
            this.internalQuery.leftJoin(
                'last_seen_at_metrics',
                'last_seen_at_metrics.feature_name',
                'features.name',
            );
        }

        return this;
    };

    withFavorites = (userId: number) => {
        this.internalQuery.leftJoin(`favorite_features`, function () {
            this.on('favorite_features.feature', 'features.name').andOnVal(
                'favorite_features.user_id',
                '=',
                userId,
            );
        });

        return this;
    };

    forProject = (project: string[]) => {
        this.internalQuery.whereIn('features.project', project);
    };
}
