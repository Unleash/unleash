exports.up = (db, cb) => {
  db.runSql(`
    INSERT INTO permissions(permission, display_name, type) VALUES
    ('RELEASE_PLAN_TEMPLATE_VIEW_OVERVIEW', 'View overview of release plan templates', 'root'),
    ('RELEASE_PLAN_TEMPLATE_VIEW', 'View details of specific release plan template', 'root'),
    ('RELEASE_PLAN_TEMPLATE_CREATE', 'Create release plan template', 'root'),
    ('RELEASE_PLAN_TEMPLATE_UPDATE', 'Update release plan template', 'root'),
    ('RELEASE_PLAN_TEMPLATE_DELETE', 'Delete release plan template', 'root');
    INSERT INTO role_permission(role_id, permission, created_by_user_id)
            SELECT id, 'RELEASE_PLAN_TEMPLATE_VIEW_OVERVIEW', '-1337' FROM roles WHERE type = 'root';
    INSERT INTO role_permission(role_id, permission, created_by_user_id)
            SELECT id, 'RELEASE_PLAN_TEMPLATE_VIEW', '-1337' FROM roles WHERE name IN ('Editor', 'Admin') AND type = 'root';
    INSERT INTO role_permission(role_id, permission, created_by_user_id)
            SELECT id, 'RELEASE_PLAN_TEMPLATE_CREATE', '-1337' FROM roles WHERE name IN ('Editor', 'Admin') AND type = 'root';
    INSERT INTO role_permission(role_id, permission, created_by_user_id)
            SELECT id, 'RELEASE_PLAN_TEMPLATE_UPDATE', '-1337' FROM roles WHERE name IN ('Editor', 'Admin') AND type = 'root';
    INSERT INTO role_permission(role_id, permission, created_by_user_id)
            SELECT id, 'RELEASE_PLAN_TEMPLATE_DELETE', '-1337' FROM roles WHERE name = 'Admin' AND type = 'root';
  `, cb);

};

exports.down = (db, cb) => {
  db.runSql(`
      DELETE
      FROM permissions
      WHERE permission IN
            ('RELEASE_PLAN_TEMPLATE_VIEW_OVERVIEW', 'RELEASE_PLAN_TEMPLATE_VIEW', 'RELEASE_PLAN_TEMPLATE_CREATE',
             'RELEASE_PLAN_TEMPLATE_UPDATE', 'RELEASE_PLAN_TEMPLATE_DELETE');
  `, cb);
};

