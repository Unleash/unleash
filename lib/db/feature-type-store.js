'use strict';

const COLUMNS = ['id', 'name', 'description', 'lifetime_days'];
const TABLE = 'feature_types';

class FeatureToggleStore {
    constructor(db, getLogger) {
        this.db = db;
        this.getLogger = getLogger('feature-type-store.js');
    }

    getAll() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .map(this.rowToFeatureType);
    }

    rowToFeatureType(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            lifetimeDays: row.lifetime_days,
        };
    }
}

module.exports = FeatureToggleStore;
