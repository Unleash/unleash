exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS permissions
        (   id              SERIAL PRIMARY KEY,
            permission      VARCHAR(255) NOT NULL,
            environment     VARCHAR(255),
            created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS permission_types (
            permission      VARCHAR(255),
            display_name    TEXT,
            type            VARCHAR(255)
        );

        INSERT INTO permissions (permission, environment) (select distinct permission,environment from role_permission);

        ALTER TABLE role_user ADD COLUMN
        project        VARCHAR(255);

        UPDATE role_user
            SET project = roles.project
            FROM roles
            WHERE role_user.role_id = roles.id;

        ALTER TABLE role_user DROP CONSTRAINT role_user_pkey;
        ALTER TABLE role_user ADD PRIMARY KEY (role_id, user_id, project);

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
        DROP COLUMN environment;

        INSERT INTO permission_types (permission, display_name, type) VALUES ('ADMIN', 'Admin', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CLIENT', 'Client', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CREATE_STRATEGY','Create Strategies', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CREATE_ADDON', 'Create Addons', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_ADDON', 'Delete Addons', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_ADDON', 'Update Addons', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CREATE_FEATURE', 'Create Feature Toggles', 'project');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_FEATURE', 'Update Feature Toggles', 'project');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_FEATURE', 'Delete Feature Toggles', 'project');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_APPLICATION', 'Update Applications', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_TAG_TYPE', 'Update Tag Types', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_TAG_TYPE', 'Delete Tag Types', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CREATE_PROJECT', 'Create Projects', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_PROJECT', 'Update Projects', 'project');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_PROJECT', 'Delete Projects', 'project');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_FEATURE_STRATEGY', 'Update Strategies on Toggles', 'environment');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CREATE_FEATURE_STRATEGY', 'Add Strategies to Toggles', 'environment');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_FEATURE_STRATEGY', 'Remove Strategies from Toggles', 'environment');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_STRATEGY', 'Update Strategies', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_STRATEGY', 'Delete Strategies', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_FEATURE_ENVIRONMENT', 'Enable/Disable Toggles for Environments', 'environment');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('UPDATE_CONTEXT_FIELD', 'Update Context Fields', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('CREATE_CONTEXT_FIELD', 'Create Context Fields', 'root');
        INSERT INTO permission_types (permission, display_name, type) VALUES ('DELETE_CONTEXT_FIELD', 'Delete Context Fields', 'root');
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
