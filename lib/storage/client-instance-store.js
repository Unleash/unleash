/* eslint camelcase: "off" */
'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const { ONE_DAY } = require('./utils/const/timings');
const { TABLE, COLUMNS } = require('./utils/const/instance-store');
const { mapRow } = require('./utils/mappings/client-instance-store');

class ClientInstanceStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('client-instance-store.js');
        const clearer = () => this._removeInstancesOlderThanTwoDays();
        setTimeout(clearer, 10).unref();
        setInterval(clearer, ONE_DAY).unref();
    }

    _removeInstancesOlderThanTwoDays() {
        this.db(TABLE)
            .whereRaw("created_at < now() - interval '2 days'")
            .del()
            .then(
                res => res > 0 && this.logger.info(`Deleted ${res} instances`)
            );
    }

    updateRow(details) {
        return this.db(TABLE)
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .update({
                last_seen: 'now()',
                client_ip: details.clientIp,
                sdk_version: details.sdkVersion,
            });
    }

    insertNewRow(details) {
        return this.db(TABLE).insert({
            app_name: details.appName,
            instance_id: details.instanceId,
            sdk_version: details.sdkVersion,
            client_ip: details.clientIp,
        });
    }

    insert(details) {
        return this.db(TABLE)
            .count('*')
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .map(row => ({ count: row.count }))
            .then(rows => {
                if (rows[0].count > 0) {
                    return this.updateRow(details);
                } else {
                    return this.insertNewRow(details);
                }
            })
            .then(
                metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
                    store: 'instance',
                    action: 'insert',
                })
            );
    }

    getAll() {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('last_seen', 'desc')
            .map(mapRow)
            .then(
                metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
                    store: 'instance',
                    action: 'getAll',
                })
            );
    }

    getByAppName(appName) {
        return this.db
            .select()
            .from(TABLE)
            .where('app_name', appName)
            .orderBy('last_seen', 'desc')
            .map(mapRow);
    }

    getApplications() {
        return this.db
            .distinct('app_name')
            .select(['app_name'])
            .from(TABLE)
            .orderBy('app_name', 'desc')
            .map(mapRow);
    }
}

module.exports = ClientInstanceStore;
