'use strict';

exports.up = function(knex) {
    return knex.schema.table('features', table =>
        table.json('variants').defaultTo('[]')
    );
};

exports.down = function(knex) {
    return knex.schema.table('features', table => table.dropColumn('variants'));
};
