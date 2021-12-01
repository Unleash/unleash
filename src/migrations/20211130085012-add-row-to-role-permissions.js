exports.up = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE role_permission ADD COLUMN environment text;
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'CREATE_FEATURE_STRATEGY', 'default');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_STRATEGY', 'default');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'TOGGLE_FEATURE_ENVIRONMENT', 'default');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'CREATE_FEATURE_STRATEGY', 'development');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_STRATEGY', 'development');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'TOGGLE_FEATURE_ENVIRONMENT', 'development');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'CREATE_FEATURE_STRATEGY', 'production');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'UPDATE_FEATURE_STRATEGY', 'production');
      INSERT INTO role_permission (role_id, project, permission, environment) VALUES ('2', 'default', 'TOGGLE_FEATURE_ENVIRONMENT', 'production');
      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
         DELETE FROM role_permission WHERE environment IS NOT NULL;
         ALTER TABLE role_permission DROP COLUMN environment;    
    `,
        cb,
    );
};
