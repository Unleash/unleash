/* eslint camelcase: "off" */

'use strict';

const async = require('async');

exports.up = function (db, callback) {
    const populateNewData = (cb) => {
        db.all(
            'select name, parameters_template from strategies',
            (err, results) => {
                const updateSQL = results
                    .map(({ name, parameters_template }) => {
                        const parameters = [];
                        Object.keys(parameters_template || {}).forEach((p) => {
                            parameters.push({
                                name: p,
                                type: parameters_template[p],
                                description: '',
                                required: false,
                            });
                        });
                        return { name, parameters };
                    })
                    .map(
                        (strategy) => `
                UPDATE strategies 
                SET parameters='${JSON.stringify(strategy.parameters)}'
                WHERE name='${strategy.name}';`,
                    )
                    .join('\n');

                db.runSql(updateSQL, cb);
            },
        );
    };

    async.series(
        [
            db.addColumn.bind(db, 'strategies', 'parameters', { type: 'json' }),
            populateNewData.bind(db),
            db.removeColumn.bind(db, 'strategies', 'parameters_template'),
        ],
        callback,
    );
};

exports.down = function (db, callback) {
    const populateOldData = (cb) => {
        db.all('select name, parameters from strategies', (err, results) => {
            const updateSQL = results
                .map(({ name, parameters }) => {
                    const parameters_template = {};
                    parameters.forEach((p) => {
                        parameters_template[p.name] = p.type;
                    });

                    return { name, parameters_template };
                })
                .map(
                    (strategy) => `
                UPDATE strategies 
                SET parameters_template='${JSON.stringify(
                    strategy.parameters_template,
                )}'
                WHERE name='${strategy.name}';`,
                )
                .join('\n');

            db.runSql(updateSQL, cb);
        });
    };

    async.series(
        [
            db.addColumn.bind(db, 'strategies', 'parameters_template', {
                type: 'json',
            }),
            populateOldData.bind(db),
            db.removeColumn.bind(db, 'strategies', 'parameters'),
        ],
        callback,
    );
};
