'use strict';

exports.up = function(knex) {
    return knex.schema
        .table('features', table => table.json('strategies'))
        .then(() =>
            knex('features').select('name', 'parameters', 'strategy_name')
        )
        .then(result =>
            result.map(row =>
                knex('features')
                    .where('name', row.name)
                    .update({
                        strategies: `[{"name":"${
                            row.strategy_name
                        }","parameters":${row.parameters}]`,
                    })
            )
        )
        .then(() =>
            knex.schema.table('features', table =>
                table.dropColumn('strategy_name')
            )
        )
        .then(() =>
            knex.schema.table('features', table =>
                table.dropColumn('parameters')
            )
        );
};

exports.down = function(knex) {
    return knex.schema
        .table('features', table => table.json('parameters'))
        .then(() =>
            knex.schema.table('features', table =>
                table.string('strategy_name', 255)
            )
        )
        .then(() => knex('features').select('name', 'strategies'))
        .then(result =>
            result.map(row => {
                const firstStrategy = JSON.parse(row.strategies)[0];
                return knex('features')
                    .where('name', row.name)
                    .update({
                        // eslint-disable-next-line camelcase
                        strategy_name: firstStrategy.name,
                        parameters: firstStrategy.parameters,
                    });
            })
        )
        .then(() =>
            knex.schema.table('features', table =>
                table.dropColumn('strategies')
            )
        );
};
