exports.up = function (db, cb) {
    db.runSql(
        `
    CREATE OR REPLACE FUNCTION assign_unleash_permission_to_role(permission_name text, role_name text) returns void as
    $$
    declare role_id int;
            permission_id int;
BEGIN
    role_id := (SELECT id FROM roles WHERE name = role_name);
    permission_id := (SELECT p.id FROM permissions p WHERE p.permission = permission_name);
    INSERT INTO role_permission(role_id, permission_id) VALUES (role_id, permission_id);
END
$$ language plpgsql;

    SELECT assign_unleash_permission_to_role('READ_CLIENT_API_TOKEN', 'Editor');
    SELECT assign_unleash_permission_to_role('READ_FRONTEND_API_TOKEN', 'Editor');

    `,
        cb,
    );
};
exports.down = function (db, cb) {
    db.runSql(
        `DROP FUNCTION IF EXISTS assign_unleash_permission_to_role(text, text)`,
        cb,
    );
};
