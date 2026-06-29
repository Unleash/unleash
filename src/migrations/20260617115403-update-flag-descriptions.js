const DESCRIPTION = {
    RELEASE:
        'Roll out new or incomplete features. Expected lifetime ~40 days',
    EXPERIMENT: 'A/B and multivariate testing. Expected lifetime ~40 days',
    KILLSWITCH:
        'Quickly disable certain functionalities or features. Expected lifetime: permanent',
    OPERATIONAL:
        'Transition between technical implementations with minimal risk. Expected lifetime: ~7 days',
    PERMISSION:
        'Control feature access based on user roles or entitlements. Expected lifetime: permanent',
    SUNSET:
        'Coordinate the planned removal of an existing feature. Expected lifetime: ~90 days',
};

const PREVIOUS_DESCRIPTION = {
    RELEASE: 'Release feature toggles are used to release new features.',
    EXPERIMENT:
        'Experiment feature toggles are used to test and verify multiple different versions of a feature.',
    OPERATIONAL:
        'Operational feature toggles are used to control aspects of a rollout.',
    KILLSWITCH:
        'Kill switch feature toggles are used to quickly turn on or off critical functionality in your system.',
    PERMISSION:
        'Permission feature toggles are used to control permissions in your system.',
    SUNSET: 'Used to gradually reduce exposure and remove a feature from the code.',
};

exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE feature_types set description = '${DESCRIPTION.RELEASE}' where id = 'release';
        UPDATE feature_types set description = '${DESCRIPTION.EXPERIMENT}' where id = 'experiment';
        UPDATE feature_types set description = '${DESCRIPTION.OPERATIONAL}' where id = 'operational';
        UPDATE feature_types set description = '${DESCRIPTION.KILLSWITCH}' where id = 'kill-switch';
        UPDATE feature_types set description = '${DESCRIPTION.PERMISSION}' where id = 'permission';
        UPDATE feature_types set description = '${DESCRIPTION.SUNSET}' where id = 'sunset';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        UPDATE feature_types set description = '${PREVIOUS_DESCRIPTION.RELEASE}' where id = 'release';
        UPDATE feature_types set description = '${PREVIOUS_DESCRIPTION.EXPERIMENT}' where id = 'experiment';
        UPDATE feature_types set description = '${PREVIOUS_DESCRIPTION.OPERATIONAL}' where id = 'operational';
        UPDATE feature_types set description = '${PREVIOUS_DESCRIPTION.KILLSWITCH}' where id = 'kill-switch';
        UPDATE feature_types set description = '${PREVIOUS_DESCRIPTION.PERMISSION}' where id = 'permission';
        UPDATE feature_types set description = '${PREVIOUS_DESCRIPTION.SUNSET}' where id = 'sunset';
  `,
        cb,
    );
};
