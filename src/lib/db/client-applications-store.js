/* eslint camelcase:off */

const NotFoundError = require('../error/notfound-error');

const COLUMNS = [
    'app_name',
    'created_at',
    'created_by',
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
    createdBy: row.created_by,
    url: row.url,
    color: row.color,
    icon: row.icon,
});

const remapRow = input => ({
    app_name: input.appName,
    updated_at: input.updatedAt,
    description: input.description,
    created_by: input.createdBy,
    announced: input.announced || false,
    url: input.url,
    color: input.color,
    icon: input.icon,
    strategies: JSON.stringify(input.strategies),
});

const mergeColumns = [
    'updated_at',
    'description',
    'strategies',
    'url',
    'color',
    'icon',
];

class ClientApplicationsDb {
    constructor(db, eventBus) {
        this.db = db;
        this.eventBus = eventBus;
    }

    async upsert(details) {
        const row = remapRow(details);
        return this.db(TABLE)
            .insert(row)
            .onConflict('app_name')
            .merge(mergeColumns);
    }

    async bulkUpsert(apps) {
        const rows = apps.map(remapRow);
        return this.db(TABLE)
            .insert(rows)
            .onConflict('app_name')
            .merge(mergeColumns);
    }

    async exists({ appName }) {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE app_name = ?) AS present`,
            [appName],
        );
        const { present } = result.rows[0];
        return present;
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

    async getUnannounced() {
        const rows = await this.db(TABLE)
            .select(COLUMNS)
            .where('announced', false);
        return rows.map(mapRow);
    }

    /** *
     * Updates all rows that have announced = false to announced =true and returns the rows altered
     * @return {[app]} - Apps that hadn't been announced
     */
    async setUnannouncedToAnnounced() {
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .whereNotNull('announced')
            .returning(COLUMNS);
        return rows.map(mapRow);
    }
}

module.exports = ClientApplicationsDb;
