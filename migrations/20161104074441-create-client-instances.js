'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('client_instances', table => {
        table.string('app_name', 255);
        table.string('instance_id', 255);
        table.string('client_ip', 255);
        table
            .timestamp('last_seen')
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .timestamp('created_at')
            .notNullable()
            .defaultTo(knex.fn.now());
        table.primary(['app_name', 'instance_id']);
        table.charset('utf8');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('client_instances');
};
