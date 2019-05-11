'use strict';

exports.up = function(knex) {
    return knex.schema
        .table('strategies', table => table.integer('built_in'))
        .then(() =>
            knex('strategies')
                .where('name', 'default')
                // eslint-disable-next-line camelcase
                .update({ built_in: 1 })
        );
};

exports.down = function(knex) {
    return knex.schema.table('strategies', table =>
        table.dropColumn('built_in')
    );
};
