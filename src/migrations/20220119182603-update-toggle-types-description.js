/* eslint camelcase: "off" */
'use strict';

const DESCRIPTION = {
    RELEASE: 'Release feature toggles are used to release new features.',
    EXPERIMENT:
        'Experiment feature toggles are used to test and verify multiple different versions of a feature.',
    OPERATIONAL:
        'Operational feature toggles are used to control aspects of a rollout.',
    KILLSWITCH:
        'Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.',
    PERMISSION:
        'Permission feature toggles are used to control permissions in your system.',
};

exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE feature_types set description = '${DESCRIPTION.RELEASE}' where id = 'release';
        UPDATE feature_types set description = '${DESCRIPTION.EXPERIMENT}' where id = 'experiment';
        UPDATE feature_types set description = '${DESCRIPTION.OPERATIONAL}' where id = 'operational';
        UPDATE feature_types set description = '${DESCRIPTION.KILLSWITCH}' where id = 'kill-switch';
        UPDATE feature_types set description = '${DESCRIPTION.PERMISSION}' where id = 'permission';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    `,
        cb,
    );
};
