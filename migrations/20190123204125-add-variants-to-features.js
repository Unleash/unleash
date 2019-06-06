'use strict';

exports.up = function(knex) {
    return knex.schema.table('features', table => table.json('variants'));
};

exports.down = function(knex) {
    return knex.schema.table('features', table => table.dropColumn('variants'));
};
