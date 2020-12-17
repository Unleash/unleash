'use strict';

const COLUMNS = ['id', 'name', 'description', 'lifetime_days'];
const TABLE = 'feature_types';

class FeatureToggleStore {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('feature-type-store.js');
    }

    async getAll() {
        const rows = await this.db.select(COLUMNS).from(TABLE);
        return rows.map(this.rowToFeatureType);
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
