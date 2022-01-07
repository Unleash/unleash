/* eslint camelcase: "off" */

'use strict';

const async = require('async');

exports.up = function (db, cb) {
    async.series(
        [
            db.createTable.bind(db, 'feature_types', {
                id: {
                    type: 'string',
                    length: 255,
                    primaryKey: true,
                    notNull: true,
                },
                name: { type: 'string', notNull: true },
                description: { type: 'string' },
                lifetime_days: { type: 'int' },
            }),
            db.runSql.bind(
                db,
                `
                INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('release', 'Release', 'Release feature toggles are used to release new features.', 40);
                INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('experiment', 'Experiment', 'Experiment feature toggles are used to test and verify multiple different versions of a feature.', 40);
                INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('operational', 'Operational', 'Operational feature toggles are used to control aspects of a rollout.', 7);
                INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('kill-switch', 'Kill switch', 'Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.', null);
                INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('permission', 'Permission', 'Permission feature toggles are used to control permissions in your system.', null);
              `,
            ),
        ],
        cb,
    );
};

exports.down = function (db, cb) {
    return db.dropTable('feature_types', cb);
};
