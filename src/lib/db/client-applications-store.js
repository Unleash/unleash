/* eslint camelcase:off */

const NotFoundError = require('../error/notfound-error');

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

    async updateRow(details) {
        // eslint-disable-next-line no-param-reassign
        return this.db(TABLE)
            .insert(remapRow(details))
            .onConflict('app_name')
            .merge();
    }

    async bulkUpsert(apps) {
        const rows = apps.map(remapRow);
        return this.db(TABLE)
            .insert(rows)
            .onConflict('app_name')
            .merge();
    }

    async exists({ appName }) {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE app_name = ?) AS present`,
            [appName],
        );
        const { present } = result.rows[0];
        return present;
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

        if (!row) {
            throw new NotFoundError(`Could not find appName=${appName}`);
        }

        return mapRow(row);
    }

    async deleteApplication(appName) {
        return this.db(TABLE)
            .where('app_name', appName)
            .del();
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
