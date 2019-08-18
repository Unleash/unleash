'use strict';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_IMPORT,
    DROP_FEATURES,
} = require('../event-type');
const NotFoundError = require('../error/notfound-error');
const { TABLE, COLUMNS } = require('./utils/const/feature-toggle-store');
const {
    mapRow,
    eventDataToRow,
} = require('./utils/mappings/client-feature-toggle-store');

class FeatureToggleStore {
    constructor(db, eventStore, getLogger) {
        this.db = db;
        this.getLogger = getLogger('client-toggle-store.js');
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
        eventStore.on(FEATURE_IMPORT, event => this._importFeature(event.data));
        eventStore.on(DROP_FEATURES, () => this._dropFeatures());
    }

    getFeatures() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .where({ archived: 0 })
            .orderBy('name', 'asc')
            .map(mapRow);
    }

    getFeature(name) {
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name, archived: 0 })
            .then(mapRow);
    }

    hasFeature(name) {
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

    getArchivedFeatures() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .where({ archived: 1 })
            .orderBy('name', 'asc')
            .map(mapRow);
    }

    _createFeature(data) {
        return this.db(TABLE)
            .insert(eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not insert feature, error: ', err)
            );
    }

    _updateFeature(data) {
        return this.db(TABLE)
            .where({ name: data.name })
            .update(eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not update feature, error: ', err)
            );
    }

    _archiveFeature({ name }) {
        return this.db(TABLE)
            .where({ name })
            .update({ archived: 1, enabled: 0 })
            .catch(err => {
                this.logger.error('Could not archive feature, error: ', err);
            });
    }

    _reviveFeature({ name }) {
        return this.db(TABLE)
            .where({ name })
            .update({ archived: 0, enabled: 0 })
            .catch(err =>
                this.logger.error('Could not archive feature, error: ', err)
            );
    }

    _importFeature(data) {
        const rowData = eventDataToRow(data);
        return this.db(TABLE)
            .where({ name: rowData.name })
            .update(rowData)
            .then(result =>
                result === 0 ? this.db(TABLE).insert(rowData) : result
            )
            .catch(err =>
                this.logger.error('Could not import feature, error: ', err)
            );
    }

    _dropFeatures() {
        return this.db(TABLE)
            .delete()
            .catch(err =>
                this.logger.error('Could not drop features, error: ', err)
            );
    }
}

module.exports = FeatureToggleStore;
