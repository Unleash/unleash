/* eslint camelcase: "off" */
'use strict';

const COLUMNS = ['app_name', 'instance_id', 'client_ip', 'last_seen', 'created_at'];
const TABLE = 'client_instances';

const mapRow = (row) => ({
    appName: row.app_name,
    instanceId: row.instance_id,
    clientIp: row.client_ip,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
});

class ClientInstanceStore {

    constructor (db) {
        this.db = db;
    }

    updateRow (details) {
        return this.db(TABLE)
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .update({
                last_seen: 'now()',
                client_ip: details.clientIp,
            });
    }

    insertNewRow (details) {
        return this.db(TABLE).insert({
            app_name: details.appName,
            instance_id: details.instanceId,
            client_ip: details.clientIp,
        });
    }

    insert (details) {
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
            });
    }

    getAll () {
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('last_seen', 'desc')
            .map(mapRow);
    }
};

module.exports = ClientInstanceStore;
