exports.up = function (db, cb) {
    db.runSql(`
        UPDATE permissions SET display_name = 'Create feature flags' WHERE permission = 'CREATE_FEATURE' AND type = 'project';
        UPDATE permissions SET display_name = 'Update feature flags' WHERE permission = 'UPDATE_FEATURE' AND type = 'project';
        UPDATE permissions SET display_name = 'Delete feature flags' WHERE permission = 'DELETE_FEATURE' AND type = 'project';
        UPDATE permissions SET display_name = 'Change feature flag project' WHERE permission = 'MOVE_FEATURE_TOGGLE' AND type = 'project';
        UPDATE permissions SET display_name = 'Enable/disable flags' WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT' AND type = 'environment';
    `, cb);
};

exports.down = function (db, cb) {
    db.runSql(
        `
            UPDATE permissions
            SET display_name = 'Create feature toggles'
            WHERE permission = 'CREATE_FEATURE'
              AND type = 'project';

            UPDATE permissions
            SET display_name = 'Update feature toggles'
            WHERE permission = 'UPDATE_FEATURE'
              AND type = 'project';

            UPDATE permissions
            SET display_name = 'Delete feature toggles'
            WHERE permission = 'DELETE_FEATURE'
              AND type = 'project';

            UPDATE permissions
            SET display_name = 'Change feature toggle project'
            WHERE permission = 'MOVE_FEATURE_TOGGLE'
              AND type = 'project';

            UPDATE permissions
            SET display_name = 'Enable/disable toggles'
            WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT'
              AND type = 'environment';
        `,
        cb,
    );
};
