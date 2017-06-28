'use strict';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
} = require('../event-type');
const logger = require('../logger');
const NotFoundError = require('../error/notfound-error');
const FEATURE_COLUMNS = [
    'name',
    'description',
    'enabled',
    'strategies',
    'created_at',
];
const TABLE = 'features';

class FeatureToggleStore {
    constructor(db, eventStore) {
        this.db = db;
        eventStore.on(FEATURE_CREATED, event =>
            this._createFeature(event.data)
        );
        eventStore.on(FEATURE_UPDATED, event =>
            this._updateFeature(event.data)
        );
        eventStore.on(FEATURE_ARCHIVED, event =>
            this._archiveFeature(event.data)
        );
        eventStore.on(FEATURE_REVIVED, event =>
            this._reviveFeature(event.data)
        );
    }

    getFeatures() {
        return this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: 0 })
            .orderBy('name', 'asc')
            .map(this.rowToFeature);
    }

    getFeature(name) {
        return this.db
            .first(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ name, archived: 0 })
            .then(this.rowToFeature);
    }

    getArchivedFeatures() {
        return this.db
            .select(FEATURE_COLUMNS)
            .from(TABLE)
            .where({ archived: 1 })
            .orderBy('name', 'asc')
            .map(this.rowToFeature);
    }

    rowToFeature(row) {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        return {
            name: row.name,
            description: row.description,
            enabled: row.enabled > 0,
            strategies: row.strategies,
            createdAt: row.created_at,
        };
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            enabled: data.enabled ? 1 : 0,
            archived: data.archived ? 1 : 0,
            strategies: JSON.stringify(data.strategies),
        };
    }

    _createFeature(data) {
        return this.db(TABLE)
            .insert(this.eventDataToRow(data))
            .catch(err =>
                logger.error('Could not insert feature, error was: ', err)
            );
    }

    _updateFeature(data) {
        return this.db(TABLE)
            .where({ name: data.name })
            .update(this.eventDataToRow(data))
            .catch(err =>
                logger.error('Could not update feature, error was: ', err)
            );
    }

    _archiveFeature({ name }) {
        return this.db(TABLE)
            .where({ name })
            .update({ archived: 1, enabled: 0 })
            .catch(err => {
                logger.error('Could not archive feature, error was: ', err);
            });
    }

    _reviveFeature({ name }) {
        return this.db(TABLE)
            .where({ name })
            .update({ archived: 0, enabled: 0 })
            .catch(err =>
                logger.error('Could not archive feature, error was: ', err)
            );
    }
}

module.exports = FeatureToggleStore;
