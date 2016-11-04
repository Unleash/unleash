'use strict';

const COLUMNS = ['app_name', 'strategies'];
const TABLE = 'client_strategies';

module.exports = function (db) {
    function updateRow (appName, strategies) {
        return db(TABLE)
            .where('app_name', appName)  // eslint-disable-line
            .update({
                strategies: JSON.stringify(strategies),
                updated_at: 'now()', // eslint-disable-line
            });
    }

    function insertNewRow (appName, strategies) {
        return db(TABLE).insert({
            app_name: appName,  // eslint-disable-line
            strategies: JSON.stringify(strategies),
        });
    }

    function insert (appName, strategies) {
        return db(TABLE)
            .count('*')
            .where('app_name', appName)
            .map(row => ({ count: row.count }))
            .then(rows => {
                if (rows[0].count > 0) {
                    return updateRow(appName, strategies);
                } else {
                    return insertNewRow(appName, strategies);
                }
            });
    }

    function getAll () {
        return db
            .select(COLUMNS)
            .from(TABLE)
            .map(mapRow);
    }

    function mapRow (row) {
        return {
            appName: row.app_name,
            strategies: row.strategies,
        };
    }

    return { insert, getAll };
};
