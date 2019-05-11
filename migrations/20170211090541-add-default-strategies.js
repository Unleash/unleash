/* eslint-disable camelcase */
'use strict';

const strategies = require('./default-strategies.json');
const Promise = require('bluebird');

exports.up = function(knex) {
    return Promise.all(
        strategies.map(strategy =>
            knex('events')
                .insert({
                    type: 'strategy-created',
                    created_by: 'migration',
                    data: JSON.stringify(strategy),
                })
                .then(
                    () =>
                        knex('strategies')
                            .where('name', strategy.name)
                            .delete()
                    /*
                     * There should not be any users affected by this delete.
                     */
                )
                .then(() =>
                    knex('strategies').insert({
                        name: strategy.name,
                        description: strategy.description,
                        parameters: JSON.stringify(strategy.parameters),
                        built_in: 1,
                    })
                )
                .catch()
        )
    );
};

exports.down = function(knex) {
    const names = strategies.map(s => s.name);
    const insertEvents = strategies.map(defaultStrategy =>
        knex('strategies')
            .where('built_in', '1')
            .andWhere('name', defaultStrategy.name)
            .select()
            .then(result => {
                if (result.size === 1) {
                    knex('events').insert({
                        type: 'strategy-deleted',
                        created_by: 'migration',
                        data: JSON.stringify(defaultStrategy),
                    });
                }
            })
    );
    return Promise.all(insertEvents).then(() =>
        knex('strategies')
            .where(builder =>
                builder.where('built_in', '1').whereIn('name', names)
            )
            .delete()
    );
};
