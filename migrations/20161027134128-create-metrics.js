'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('client_metrics', table => {
        table.increments('id').primary();
        table
            .timestamp('created_at')
            .notNullable()
            .defaultTo(knex.fn.now());
        table.json('metrics');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('client_metrics');
};
