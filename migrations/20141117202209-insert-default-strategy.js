'use strict';

exports.up = function(knex) {
    return knex('strategies').insert({
        name: 'default',
        description: 'Default on/off strategy.',
    });
};

exports.down = function(knex) {
    return knex('strategies')
        .where('name', 'default')
        .delete();
};
