exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS permissions
        (   id              SERIAL PRIMARY KEY,
            permission      VARCHAR(255) NOT NULL,
            environment     VARCHAR(255),
            display_name    TEXT,
            created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        INSERT INTO permissions (permission, environment, display_name) (SELECT DISTINCT permission, environment, '' from role_permission);

        ALTER TABLE role_user ADD COLUMN
        project        VARCHAR(255);

        UPDATE role_user
            SET project = roles.project
            FROM roles
            WHERE role_user.role_id = roles.id;

        ALTER TABLE roles DROP COLUMN project;

        ALTER TABLE roles
        ADD COLUMN
            updated_at  TIMESTAMP WITH TIME ZONE;

        ALTER TABLE role_permission
        ADD COLUMN
            permission_id INTEGER;

            UPDATE role_permission
            SET permission_id = permissions.id
            FROM permissions
            WHERE
                (role_permission.environment = permissions.environment
                    OR (role_permission.environment IS NULL AND permissions.environment IS NULL))
                AND
                    role_permission.permission = permissions.permission;

        ALTER TABLE role_permission
        DROP COLUMN project,
        DROP COLUMN permission,
        DROP COLUMN environment
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
