'use strict';

exports.up = function(knex) {
    return knex.schema.createTable('client_applications', table => {
        table
            .string('app_name', 255)
            .notNullable()
            .primary();
        table
            .timestamp('created_at')
            .notNullable()
            .defaultTo(knex.fn.now());
        table
            .timestamp('updated_at')
            .notNullable()
            .defaultTo(knex.fn.now());
        table.timestamp('seen_at');
        table.json('strategies');
        table.string('description', 255);
        table.string('icon', 255);
        table.string('url', 255);
        table.string('color', 255);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('client_applications');
};
