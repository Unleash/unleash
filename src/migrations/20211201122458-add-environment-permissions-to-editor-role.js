exports.up = function (db, cb) {
    db.runSql(
        `
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'CREATE_FEATURE_STRATEGY', 'default');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_STRATEGY', 'default');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_ENVIRONMENT', 'default');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'DELETE_FEATURE_STRATEGY', 'default');

      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'CREATE_FEATURE_STRATEGY', 'development');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_STRATEGY', 'development');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_ENVIRONMENT', 'development');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'DELETE_FEATURE_STRATEGY', 'development');

      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'CREATE_FEATURE_STRATEGY', 'production');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_STRATEGY', 'production');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_ENVIRONMENT', 'production');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'DELETE_FEATURE_STRATEGY', 'production');
      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
         DELETE FROM role_permission WHERE environment IS NOT NULL;
    `,
        cb,
    );
};
