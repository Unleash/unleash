'use strict';

const eventType = require('../event-type');
const logger = require('../logger');
const NotFoundError = require('../error/notfound-error');
const FEATURE_COLUMNS = ['name', 'description', 'enabled', 'strategies'];

class FeatureToggleStore {
    constructor (db, eventStore) {
        this.db = db;
        eventStore.on(eventType.featureCreated, event => this._createFeature(event.data));
        eventStore.on(eventType.featureUpdated, event => this._updateFeature(event.data));
        eventStore.on(eventType.featureArchived, event => this._archiveFeature(event.data));
        eventStore.on(eventType.featureRevived, event => this._reviveFeature(event.data));
    }
    

    getFeatures () {
        return this.db
            .select(FEATURE_COLUMNS)
            .from('features')
            .where({ archived: 0 })
            .orderBy('name', 'asc')
            .map(this.rowToFeature);
    }

    getFeature (name) {
        return this.db
            .first(FEATURE_COLUMNS)
            .from('features')
            .where({ name })
            .then(this.rowToFeature);
    }

    getArchivedFeatures () {
        return this.db
            .select(FEATURE_COLUMNS)
            .from('features')
            .where({ archived: 1 })
            .orderBy('name', 'asc')
            .map(this.rowToFeature);
    }

    rowToFeature (row) {
        if (!row) {
            throw new NotFoundError('No feature toggle found');
        }
        return {
            name: row.name,
            description: row.description,
            enabled: row.enabled > 0,
            strategies: row.strategies,
        };
    }

    eventDataToRow (data) {
        return {
            name: data.name,
            description: data.description,
            enabled: data.enabled ? 1 : 0,
            archived: data.archived ? 1 : 0,
            strategies: JSON.stringify(data.strategies),
        };
    }

    _createFeature (data) {
        return this.db('features')
            .insert(this.eventDataToRow(data))
            .catch(err => {
                logger.error('Could not insert feature, error was: ', err);
            });
    }

    _updateFeature (data) {
        return this.db('features')
            .where({ name: data.name })
            .update(this.eventDataToRow(data))
            .catch(err => {
                logger.error('Could not update feature, error was: ', err);
            });
    }

    _archiveFeature (data) {
        return this.db('features')
            .where({ name: data.name })
            .update({ archived: 1 })
            .catch(err => {
                logger.error('Could not archive feature, error was: ', err);
            });
    }

    _reviveFeature (data) {
        return this.db('features')
            .where({ name: data.name })
            .update({ archived: 0, enabled: 0 })
            .catch(err => {
                logger.error('Could not archive feature, error was: ', err);
            });
    }
};

module.exports = FeatureToggleStore;
