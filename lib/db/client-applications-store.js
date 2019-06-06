/* eslint camelcase:off */
'use strict';

const fromText = require('./json-converter').fromText;

const COLUMNS = [
    'app_name',
    'created_at',
    'updated_at',
    'description',
    'strategies',
    'url',
    'color',
    'icon',
];
const TABLE = 'client_applications';

const mapRow = row => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    strategies: fromText(row.strategies) || '',
    url: row.url,
    color: row.color,
    icon: row.icon,
});

const remapRow = (input, old = {}) => ({
    app_name: input.appName,
    updated_at: input.updatedAt,
    created_at: input.createdAt,
    description: input.description || old.description,
    url: input.url || old.url,
    color: input.color || old.color,
    icon: input.icon || old.icon,
    strategies: JSON.stringify(input.strategies || old.strategies),
});

class ClientApplicationsDb {
    constructor(db) {
        this.db = db;
    }

    updateRow(details, prev) {
        details.updatedAt = this.db.fn.now();

        return this.db(TABLE)
            .where('app_name', details.appName)
            .update(remapRow(details, prev));
    }

    insertNewRow(details) {
        details.createdAt = this.db.fn.now();
        details.updatedAt = this.db.fn.now();

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
            });
    }

    getAll() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc')
            .map(mapRow);
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

module.exports = ClientApplicationsDb;
