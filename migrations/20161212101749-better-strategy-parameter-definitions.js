'use strict';

exports.up = function(knex) {
    return knex.schema
        .table('strategies', table => {
            table.json('parameters');
        })
        .then(() => knex('strategies').select())
        .then(result =>
            result.map(row => {
                const parameters = [];
                Object.keys(row.parameters_template || {}).forEach(p => {
                    parameters.push({
                        name: p,
                        type: row.parameters_template[p],
                        description: '',
                        required: false,
                    });
                });
                return knex('strategies')
                    .where('name', row.name)
                    .update({
                        parameters: `${JSON.stringify(parameters)}`,
                    });
            })
        )
        .then(() =>
            knex.schema.table('strategies', table =>
                table.dropColumn('parameters_template')
            )
        );
};

exports.down = function(knex) {
    return knex.schema
        .table('strategies', table => {
            table.json('parameters_template');
        })
        .then(() => knex('strategies').select())
        .then(result =>
            result.map(row => {
                const parametersTemplate = {};
                Object.keys(row.parameters || {}).forEach(p => {
                    parametersTemplate[p.name] = p.type;
                });
                return knex('strategies')
                    .where('name', row.name)
                    .update({
                        // eslint-disable-next-line camelcase
                        parameters_template: `${JSON.stringify(
                            parametersTemplate
                        )}`,
                    });
            })
        )
        .then(() =>
            knex.schema.table('strategies', table =>
                table.dropColumn('parameters')
            )
        );
};
