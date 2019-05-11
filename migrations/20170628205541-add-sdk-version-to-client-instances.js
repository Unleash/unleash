'use strict';

exports.up = function(knex) {
    return knex.schema.table('client_instances', table =>
        table.string('sdk_version', 255)
    );
};

exports.down = function(knex) {
    return knex.schema.table('client_instances', table =>
        table.dropColumn('sdk_version')
    );
};
