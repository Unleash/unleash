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

    getByAppName (appName) {
        return this.db
            .select('strategies')
            .where('app_name', appName)
            .from(TABLE)
            .map((row) => row.strategies)
            .then(arr => arr[0]);
    }

    /**
     * Could also be done in SQL:
     * (not sure if it is faster though)
     *
     * SELECT app_name from (
     *   SELECT app_name, json_array_elements(strategies)::text as strategyName from client_strategies
     *   ) as foo
     * WHERE foo.strategyName = '"other"';
     */
    getAppsForStrategy (strategyName) {
        return this.getAll()
            .then(apps => apps
                .filter(app => app.strategies.includes(strategyName))
                .map(app => app.appName));
    }

    getApplications () {
        return this.db
            .select('app_name')
            .from(TABLE)
            .map((row) => row.app_name);
    }
};

module.exports = ClientStrategyStore;
