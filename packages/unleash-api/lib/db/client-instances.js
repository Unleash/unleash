/* eslint camelcase: "off" */
'use strict';

const COLUMNS = ['app_name', 'instance_id', 'client_ip', 'last_seen', 'created_at'];
const TABLE = 'client_instances';

module.exports = function (db) {
    function updateRow (details) {
        return db(TABLE)
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .update({
                last_seen: 'now()',
                client_ip: details.clientIp,
            });
    }

    function insertNewRow (details) {
        return db(TABLE).insert({
            app_name: details.appName,
            instance_id: details.instanceId,
            client_ip: details.clientIp,
        });
    }

    function insert (details) {
        console.log(details);
        return db(TABLE)
            .count('*')
            .where('app_name', details.appName)
            .where('instance_id', details.instanceId)
            .map(row => ({ count: row.count }))
            .then(rows => {
                if (rows[0].count > 0) {
                    return updateRow(details);
                } else {
                    return insertNewRow(details);
                }
            });
    }

    function getAll () {
        return db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('last_seen', 'desc')
            .map(mapRow);
    }

    function mapRow (row) {
        return {
            appName: row.app_name,
            instanceId: row.instance_id,
            clientIp: row.client_ip,
            lastSeen: row.last_seen,
            createdAt: row.created_at,
        };
    }

    return { insert, getAll };
};
