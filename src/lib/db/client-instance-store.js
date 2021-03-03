/* eslint camelcase: "off" */

'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const COLUMNS = [
    'app_name',
    'instance_id',
    'sdk_version',
    'client_ip',
    'last_seen',
    'created_at',
];
const TABLE = 'client_instances';

const ONE_DAY = 24 * 61 * 60 * 1000;

const mapRow = row => ({
    appName: row.app_name,
    instanceId: row.instance_id,
    sdkVersion: row.sdk_version,
    clientIp: row.client_ip,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
});

const mapToDb = client => ({
    app_name: client.appName,
    instance_id: client.instanceId,
    sdk_version: client.sdkVersion || '',
    client_ip: client.clientIp,
    last_seen: client.lastSeen || 'now()',
});

class ClientInstanceStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('client-instance-store.js');
        this.metricTimer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'instance',
                action,
            });
        const clearer = () => this._removeInstancesOlderThanTwoDays();
        setTimeout(clearer, 10).unref();
        this.timer = setInterval(clearer, ONE_DAY).unref();
    }

    async _removeInstancesOlderThanTwoDays() {
        const rows = await this.db(TABLE)
            .whereRaw("created_at < now() - interval '2 days'")
            .del();

        if (rows > 0) {
            this.logger.debug(`Deleted ${rows} instances`);
        }
    }

    async updateRow(details) {
        return this.db(TABLE)
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .update({
                last_seen: 'now()',
                client_ip: details.clientIp,
                sdk_version: details.sdkVersion,
            });
    }

    async bulkUpsert(instances) {
        const rows = instances.map(mapToDb);
        return this.db(TABLE)
            .insert(rows)
            .onConflict(['app_name', 'instance_id'])
            .merge();
    }

    async exists({ appName, instanceId }) {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE app_name = ? AND instance_id = ?) AS present`,
            [appName, instanceId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async countRows() {
        const count = await this.db(TABLE).count('app_name');
        return count[0].count;
    }

    async insert(details) {
        const stopTimer = this.metricTimer('insert');

        const item = await this.db(TABLE)
            .insert(mapToDb(details))
            .onConflict(['app_name', 'instance_id'])
            .merge();

        stopTimer();

        return item;
    }

    async getAll() {
        const stopTimer = this.metricTimer('getAll');

        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('last_seen', 'desc');

        const toggles = rows.map(mapRow);

        stopTimer();

        return toggles;
    }

    async getByAppName(appName) {
        const rows = await this.db
            .select()
            .from(TABLE)
            .where('app_name', appName)
            .orderBy('last_seen', 'desc');

        return rows.map(mapRow);
    }

    async getApplications() {
        const rows = await this.db
            .distinct('app_name')
            .select(['app_name'])
            .from(TABLE)
            .orderBy('app_name', 'desc');

        return rows.map(mapRow);
    }

    async deleteForApplication(appName) {
        return this.db(TABLE)
            .where('app_name', appName)
            .del();
    }

    destroy() {
        clearInterval(this.timer);
    }
}

module.exports = ClientInstanceStore;
