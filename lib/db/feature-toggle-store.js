'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');
const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_IMPORT,
    DROP_FEATURES,
} = require('../event-type');
const NotFoundError = require('../error/notfound-error');

const FEATURE_COLUMNS = [
    'name',
    'description',
    'type',
    'project',
    'enabled',
    'stale',
    'strategies',
    'variants',
    'created_at',
    'last_seen_at',
];
const TABLE = 'features';

class FeatureToggleStore {
    constructor(db, eventStore, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle',
                action,
            });

        eventStore.on(FEATURE_CREATED, event =>
            this._createFeature(event.data),
        );
        eventStore.on(FEATURE_UPDATED, event =>
            this._updateFeature(event.data),
        );
        eventStore.on(FEATURE_ARCHIVED, event =>
            this._archiveFeature(event.data),
        );
        eventStore.on(FEATURE_REVIVED, event =>
            this._reviveFeature(event.data),
        );
        eventStore.on(FEATURE_IMPORT, event => this._importFeature(event.data));
        eventStore.on(DROP_FEATURES, () => this._dropFeatures());
    }

    async getFeatures() {
        const stopTimer = this.timer('getAll');

        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: 0 })
            .orderBy('name', 'asc');

        stopTimer();

        return rows.map(this.rowToFeature);
    }

    async getFeaturesBy(fields) {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where(fields);
        return rows.map(this.rowToFeature);
    }

    async count() {
        return this.db
            .count('*')
            .from(TABLE)
            .where({ archived: 0 })
            .then(res => Number(res[0].count));
    }

    async getFeature(name) {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name, archived: 0 })
            .then(this.rowToFeature);
    }

    async hasFeature(name) {
        return this.db
            .first('name', 'archived')
            .from(TABLE)
            .where({ name })
            .then(row => {
                if (!row) {
                    throw new NotFoundError('No feature toggle found');
                }
                return {
                    name: row.name,
                    archived: row.archived === 1,
                };
            });
    }

    async getArchivedFeatures() {
        const rows = await this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: 1 })
            .orderBy('name', 'asc');
        return rows.map(this.rowToFeature);
    }

    async lastSeenToggles(togleNames) {
        const now = new Date();
        try {
            await this.db(TABLE)
                .whereIn('name', togleNames)
                .update({ last_seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }

    rowToFeature(row) {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        return {
            name: row.name,
            description: row.description,
            type: row.type,
            project: row.project,
            enabled: row.enabled > 0,
            stale: row.stale,
            strategies: row.strategies,
            variants: row.variants,
            createdAt: row.created_at,
            lastSeenAt: row.last_seen_at,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            type: data.type,
            project: data.project,
            enabled: data.enabled ? 1 : 0,
            stale: data.stale,
            archived: data.archived ? 1 : 0,
            strategies: JSON.stringify(data.strategies),
            variants: data.variants ? JSON.stringify(data.variants) : null,
            created_at: data.createdAt, // eslint-disable-line
        };
    }

    async _createFeature(data) {
        try {
            await this.db(TABLE).insert(this.eventDataToRow(data));
        } catch (err) {
            this.logger.error('Could not insert feature, error: ', err);
        }
    }

    async _updateFeature(data) {
        try {
            await this.db(TABLE)
                .where({ name: data.name })
                .update(this.eventDataToRow(data));
        } catch (err) {
            this.logger.error('Could not update feature, error: ', err);
        }
    }

    async _archiveFeature({ name }) {
        try {
            await this.db(TABLE)
                .where({ name })
                .update({ archived: 1, enabled: 0 });
        } catch (err) {
            this.logger.error('Could not archive feature, error: ', err);
        }
    }

    async _reviveFeature({ name }) {
        try {
            await this.db(TABLE)
                .where({ name })
                .update({ archived: 0, enabled: 0 });
        } catch (err) {
            this.logger.error('Could not archive feature, error: ', err);
        }
    }

    async _importFeature(data) {
        const rowData = this.eventDataToRow(data);
        try {
            const result = await this.db(TABLE)
                .where({ name: rowData.name })
                .update(rowData);

            if (result === 0) {
                await this.db(TABLE).insert(rowData);
            }
        } catch (err) {
            this.logger.error('Could not import feature, error: ', err);
        }
    }

    async _dropFeatures() {
        try {
            await this.db(TABLE).delete();
        } catch (err) {
            this.logger.error('Could not drop features, error: ', err);
        }
    }
}

module.exports = FeatureToggleStore;
