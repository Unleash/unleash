exports.up = function(db, cb) {
  db.runSql(`
    INSERT INTO permissions(permission, display_name, type) VALUES
        ('PROJECT_USER_ACCESS_READ', 'View only access to Project User Access', 'project'),
        ('PROJECT_DEFAULT_STRATEGY_READ', 'View only access to default strategy configuration for project', 'project'),
        ('PROJECT_CHANGE_REQUEST_READ', 'View only access to change request configuration for project', 'project'),
        ('PROJECT_SETTINGS_READ', 'View only access to project settings', 'project'),
        ('PROJECT_USER_ACCESS_WRITE', 'Write access to Project User Access', 'project'),
        ('PROJECT_DEFAULT_STRATEGY_WRITE', 'Write access to default strategy configuration for project', 'project'),
        ('PROJECT_CHANGE_REQUEST_WRITE', 'Write access to change request configuration for project', 'project'),
        ('PROJECT_SETTINGS_WRITE', 'Write access to project settings', 'project');
  `, cb);
};

exports.down = function(db, cb) {
    db.runSql(`
        DELETE FROM permissions WHERE permission IN ('PROJECT_USER_ACCESS_READ',
                                                     'PROJECT_DEFAULT_STRATEGY_READ',
                                                     'PROJECT_CHANGE_REQUEST_READ',
                                                     'PROJECT_SETTINGS_READ',
                                                     'PROJECT_USER_ACCESS_WRITE',
                                                     'PROJECT_DEFAULT_STRATEGY_WRITE',
                                                     'PROJECT_CHANGE_REQUEST_WRITE',
                                                     'PROJECT_SETTINGS_WRITE');
    `, cb);
};
