'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          INSERT INTO permissions (permission, display_name, type)
          values('UPDATE_FEATURE_ENVIRONMENT_VARIANTS', 'Update variants on environment', 'environment');

          INSERT INTO role_permission (role_id, permission_id, environment)
          (WITH perm_id as (SELECT id from permissions WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS')
            SELECT rp.role_id, perm_id.id, rp.environment FROM perm_id, role_permission as rp
            JOIN permissions p ON p.id = rp.permission_id
            WHERE p.permission = 'UPDATE_FEATURE_ENVIRONMENT'
          );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          DELETE FROM role_permission WHERE permission_id =
          (SELECT id FROM permissions WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS');

          DELETE FROM permissions WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS';
        `,
        callback,
    );
};
