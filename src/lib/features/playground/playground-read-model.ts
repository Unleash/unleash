import type EventEmitter from 'events';
import type { Db } from '../../db/db.js';
import { DB_TIME } from '../../metric-events.js';
import metricsHelper from '../../util/metrics-helper.js';
import { FeatureToggleRowConverter } from '../feature-toggle/converters/feature-toggle-row-converter.js';
import { FeatureToggleListBuilder } from '../feature-toggle/query-builders/feature-toggle-list-builder.js';
import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IPlaygroundReadModel } from './playground-read-model-type.js';

const SELECT_COLUMNS = [
    'features.name as name',
    'features.description as description',
    'features.type as type',
    'features.project as project',
    'features.stale as stale',
    'features.impression_data as impression_data',
    'features.created_at as created_at',
    'features.lifetime_days as lifetime_days',
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
    'fs.milestone_id as milestone_id',
    'fs.variants as strategy_variants',
    'segments.id as segment_id',
    'segments.constraints as segment_constraints',
    'df.parent as parent',
    'df.variants as parent_variants',
    'df.enabled as parent_enabled',
];

export class PlaygroundReadModel implements IPlaygroundReadModel {
    private db: Db;

    private timer: Function;

    private featureToggleRowConverter = new FeatureToggleRowConverter();

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'playground-read-model',
                action,
            });
    }

    async getFeatureWithParents(
        featureName: string,
        environment: string,
    ): Promise<FeatureConfigurationClient[]> {
        const stopTimer = this.timer('getFeatureWithParents');

        const builder = new FeatureToggleListBuilder(this.db, [
            ...SELECT_COLUMNS,
        ]);
        builder
            .query('features')
            .withArchived(false)
            .withStrategies(environment)
            .withFeatureEnvironments(environment)
            .withFeatureStrategySegments()
            .withSegments()
            .withDependentFeatureToggles();

        const nonArchivedChild = this.db('features')
            .select('name')
            .where('name', featureName)
            .whereNull('archived_at');

        builder.internalQuery.where((query) =>
            query
                .where('features.name', featureName)
                .orWhereIn(
                    'features.name',
                    this.db('dependent_features')
                        .select('parent')
                        .whereIn('child', nonArchivedChild),
                ),
        );

        const rows = await builder.internalQuery.select(
            builder.getSelectColumns(),
        );
        stopTimer();

        const features =
            this.featureToggleRowConverter.buildPlaygroundFeaturesFromRows(
                rows,
                { environment },
            );

        // the converter groups rows in an object keyed by name, which
        // enumerates integer-like names first, so row order can't be relied on
        return features.sort(
            (a, b) =>
                Number(a.name === featureName) - Number(b.name === featureName),
        );
    }
}
