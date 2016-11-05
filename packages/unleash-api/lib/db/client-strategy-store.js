'use strict';

const COLUMNS = ['app_name', 'strategies'];
const TABLE = 'client_strategies';

const mapRow = (row) => ({
    appName: row.app_name,
    strategies: row.strategies,
});

class ClientStrategyStore {
    constructor (db) {
        this.db = db;
    }

    updateRow (appName, strategies) {
        return this.db(TABLE)
            .where('app_name', appName)  // eslint-disable-line
            .update({
                strategies: JSON.stringify(strategies),
                updated_at: 'now()', // eslint-disable-line
            });
    }

    insertNewRow (appName, strategies) {
        return this.db(TABLE).insert({
            app_name: appName,  // eslint-disable-line
            strategies: JSON.stringify(strategies),
        });
    }

    insert (appName, strategies) {
        return this.db(TABLE)
            .count('*')
            .where('app_name', appName)
            .map(row => ({ count: row.count }))
            .then(rows => {
                if (rows[0].count > 0) {
                    return this.updateRow(appName, strategies);
                } else {
                    return this.insertNewRow(appName, strategies);
                }
            });
    }

    getAll () {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .map(mapRow);
    }
};

module.exports = ClientStrategyStore;
