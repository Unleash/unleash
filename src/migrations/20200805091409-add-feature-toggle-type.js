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
              INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('release', 'Release', 'Used to enable trunk-based development for teams practicing Continuous Delivery.', 40);
              INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('experiment', 'Experiment', 'Used to perform multivariate or A/B testing.', 40);
              INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('operational', 'Operational', 'Used to control operational aspects of the system behavior.', 7);
              INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('kill-switch', 'Kill switch', 'Used to to gracefully degrade system functionality.', null);
              INSERT INTO feature_types(id, name, description, lifetime_days) VALUES('permission', 'Permission', 'Used to change the features or product experience that certain users receive.', null);
              `,
            ),
        ],
        cb,
    );
};

exports.down = function (db, cb) {
    return db.dropTable('feature_types', cb);
};
