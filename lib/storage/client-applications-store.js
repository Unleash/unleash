/* eslint camelcase:off */
'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const { TABLE, COLUMNS } = require('./utils/const/application-store');
const {
    mapRow,
    remapRow,
} = require('./utils/mappings/client-application-store');

class ClientApplicationsStore {
    constructor(db, eventBus) {
        this.db = db;
        this.eventBus = eventBus;
    }

    updateRow(details, prev) {
        details.updatedAt = 'now()';
        return this.db(TABLE)
            .where('app_name', details.appName)
            .update(remapRow(details, prev))
            .then(
                metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
                    store: 'applications',
                    action: 'updateRow',
                })
            );
    }

    insertNewRow(details) {
        return this.db(TABLE).insert(remapRow(details));
    }

    upsert(data) {
        if (!data) {
            throw new Error('Missing data to add / update');
        }
        return this.db(TABLE)
            .select(COLUMNS)
            .where('app_name', data.appName)
            .then(result => {
                if (result && result[0]) {
                    return this.updateRow(data, result[0]);
                } else {
                    return this.insertNewRow(data);
                }
            })
            .then(
                metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
                    store: 'applications',
                    action: 'upsert',
                })
            );
    }

    getAll() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc')
            .map(mapRow)
            .then(
                metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
                    store: 'applications',
                    action: 'getAll',
                })
            );
    }

    getApplication(appName) {
        return this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .map(mapRow)
            .then(list => list[0]);
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
    getAppsForStrategy(strategyName) {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .map(mapRow)
            .then(apps =>
                apps.filter(app => app.strategies.includes(strategyName))
            );
    }

    getApplications(filter) {
        return filter && filter.strategyName
            ? this.getAppsForStrategy(filter.strategyName)
            : this.getAll();
    }
}

module.exports = ClientApplicationsStore;
