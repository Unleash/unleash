/* eslint camelcase: "off" */
'use strict';

/**
 * Maps from storage format to client format
 * @param {Object} row  storage format of Instance
 */
const mapRow = row => ({
    appName: row.app_name,
    instanceId: row.instance_id,
    sdkVersion: row.sdk_version,
    clientIp: row.client_ip,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
});

module.exports.mapRow = mapRow;
