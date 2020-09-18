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

class ClientInstanceStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('client-instance-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'instance',
                action,
            });
        const clearer = () => this._removeInstancesOlderThanTwoDays();
        setTimeout(clearer, 10).unref();
        setInterval(clearer, ONE_DAY).unref();
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

    async insertNewRow(details) {
        return this.db(TABLE).insert({
            app_name: details.appName,
            instance_id: details.instanceId,
            sdk_version: details.sdkVersion,
            client_ip: details.clientIp,
        });
    }

    async insert(details) {
        const stopTimer = this.timer('insert');

        const result = await this.db(TABLE)
            .count('*')
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .first();

        let item;

        if (Number(result.count) > 0) {
            item = await this.updateRow(details);
        } else {
            item = await this.insertNewRow(details);
        }

        stopTimer();

        return item;
    }

    async getAll() {
        const stopTimer = this.timer('getAll');

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
}

module.exports = ClientInstanceStore;
