'use strict';
const eventType = require('../eventType');
const logger = require('../logger');
const NotFoundError = require('../error/NotFoundError');
const FEATURE_COLUMNS = ['name', 'description', 'enabled', 'strategies'];

module.exports = function (db, eventStore) {
    eventStore.on(eventType.featureCreated, event => createFeature(event.data));

    eventStore.on(eventType.featureUpdated, event => updateFeature(event.data));

    eventStore.on(eventType.featureArchived, event => archiveFeature(event.data));

    eventStore.on(eventType.featureRevived, event => reviveFeature(event.data));

    function getFeatures () {
        return db
            .select(FEATURE_COLUMNS)
            .from('features')
            .where({ archived: 0 })
            .orderBy('name', 'asc')
            .map(rowToFeature);
    }

    function getFeature (name) {
        return db
            .first(FEATURE_COLUMNS)
            .from('features')
            .where({ name })
            .then(rowToFeature);
    }

    function getArchivedFeatures () {
        return db
            .select(FEATURE_COLUMNS)
            .from('features')
            .where({ archived: 1 })
            .orderBy('name', 'asc')
            .map(rowToFeature);
    }

    function rowToFeature (row) {
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

    function eventDataToRow (data) {
        return {
            name: data.name,
            description: data.description,
            enabled: data.enabled ? 1 : 0,
            archived: data.archived ? 1 : 0,
            strategies: JSON.stringify(data.strategies),
        };
    }

    function createFeature (data) {
        return db('features')
            .insert(eventDataToRow(data))
            .catch(err => {
                logger.error('Could not insert feature, error was: ', err);
            });
    }

    function updateFeature (data) {
        return db('features')
            .where({ name: data.name })
            .update(eventDataToRow(data))
            .catch(err => {
                logger.error('Could not update feature, error was: ', err);
            });
    }

    function archiveFeature (data) {
        return db('features')
            .where({ name: data.name })
            .update({ archived: 1 })
            .catch(err => {
                logger.error('Could not archive feature, error was: ', err);
            });
    }

    function reviveFeature (data) {
        return db('features')
            .where({ name: data.name })
            .update({ archived: 0, enabled: 0 })
            .catch(err => {
                logger.error('Could not archive feature, error was: ', err);
            });
    }


    return {
        getFeatures,
        getFeature,
        getArchivedFeatures,
        _createFeature: createFeature, // visible for testing
        _updateFeature: updateFeature,  // visible for testing
    };
};
