const { randomUUID } = require('crypto');

exports.up = function (db, cb) {
    db.runSql(
        `SELECT *
                                   FROM features`,
        (err, results) => {
            results.rows.forEach((feature) => {
                db.runSql(
                    'INSERT INTO feature_environments(feature_name, enabled) VALUES (?, ?)',
                    [feature.name, feature.enabled],
                );
                feature.strategies.forEach((strategy) => {
                    db.runSql(
                        `INSERT INTO feature_strategies(id, feature_name, project_name, strategy_name, parameters, constraints)
                                VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            randomUUID(),
                            feature.name,
                            feature.project,
                            strategy.name,
                            JSON.stringify(strategy.parameters),
                            JSON.stringify(strategy.constraints),
                        ],
                    );
                });
            });
            cb();
        },
    );
};

exports.down = function (db, cb) {
    db.runSql(
        'DELETE FROM feature_strategies; DELETE FROM feature_environments;',
        cb,
    );
};
