/* eslint camelcase:off */
'use strict';

const COLUMNS = [
    'app_name',
    'instance_id',
    'sdk_version',
    'client_ip',
    'last_seen',
    'created_at',
];
const TABLE = 'client_instances';

module.exports.TABLE = TABLE;
module.exports.COLUMNS = COLUMNS;
