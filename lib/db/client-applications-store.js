/* eslint camelcase:off */

'use strict';

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
    strategies: row.strategies,
    url: row.url,
    color: row.color,
    icon: row.icon,
});

const remapRow = (input, old = {}) => ({
    app_name: input.appName,
    updated_at: input.updatedAt,
    description: input.description || old.description,
    url: input.url || old.url,
    color: input.color || old.color,
    icon: input.icon || old.icon,
    strategies: JSON.stringify(input.strategies || old.strategies),
});

class ClientApplicationsDb {
    constructor(db, eventBus) {
        this.db = db;
        this.eventBus = eventBus;
    }

    async updateRow(details, prev) {
        // eslint-disable-next-line no-param-reassign
        details.updatedAt = 'now()';
        return this.db(TABLE)
            .where('app_name', details.appName)
            .update(remapRow(details, prev));
    }

    async insertNewRow(details) {
        return this.db(TABLE).insert(remapRow(details));
    }

    async upsert(data) {
        if (!data) {
            throw new Error('Missing data to add / update');
        }
        return this.db(TABLE)
            .select(COLUMNS)
            .where('app_name', data.appName)
            .then(result => {
                if (result && result[0]) {
                    return this.updateRow(data, result[0]);
                }
                return this.insertNewRow(data);
            });
    }

    async getAll() {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc');

        return rows.map(mapRow);
    }

    async getApplication(appName) {
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();

        return mapRow(row);
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
    async getAppsForStrategy(strategyName) {
        const rows = await this.db.select(COLUMNS).from(TABLE);

        return rows
            .map(mapRow)
            .filter(apps =>
                apps.filter(app => app.strategies.includes(strategyName)),
            );
    }

    async getApplications(filter) {
        return filter && filter.strategyName
            ? this.getAppsForStrategy(filter.strategyName)
            : this.getAll();
    }
}

module.exports = ClientApplicationsDb;
