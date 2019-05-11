'use strict';

exports.up = function(knex) {
    return knex.schema
        .createTable('strategies', table => {
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table.string('name', 255).primary();
            table.text('description');
        })
        .createTable('features', table => {
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table.string('name', 255).primary();
            table
                .integer('enabled')
                .notNullable()
                .defaultTo(0);
            table.string('strategy_name', 255);
            table.json('parameters');
        })
        .createTable('events', table => {
            table.increments('id').primary();
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table.string('type', 255);
            table.string('created_by', 255);
            table.json('data');
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('events')
        .dropTable('features')
        .dropTable('strategies');
};
