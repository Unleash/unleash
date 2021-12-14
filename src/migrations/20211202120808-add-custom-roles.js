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
        DROP COLUMN environment;

        UPDATE permissions SET display_name = 'Admin' where permission = 'ADMIN';
        UPDATE permissions SET display_name = 'Create Strategies' where permission = 'CREATE_STRATEGY';
        UPDATE permissions SET display_name = 'Create Addons' where permission = 'CREATE_ADDON';
        UPDATE permissions SET display_name = 'Delete Addons' where permission = 'DELETE_ADDON';
        UPDATE permissions SET display_name = 'Update Addons' where permission = 'UPDATE_ADDON';
        UPDATE permissions SET display_name = 'Create Feature Toggles' where permission = 'CREATE_FEATURE';
        UPDATE permissions SET display_name = 'Update Feature Toggles' where permission = 'UPDATE_FEATURE';
        UPDATE permissions SET display_name = 'Delete Feature Toggles' where permission = 'DELETE_FEATURE';
        UPDATE permissions SET display_name = 'Update Applications' where permission = 'UPDATE_APPLICATION';
        UPDATE permissions SET display_name = 'Update Tag Types' where permission = 'UPDATE_TAG_TYPE';
        UPDATE permissions SET display_name = 'Delete Tag Types' where permission = 'DELETE_TAG_TYPE';
        UPDATE permissions SET display_name = 'Create Projects' where permission = 'CREATE_PROJECT';
        UPDATE permissions SET display_name = 'Update Projects' where permission = 'UPDATE_PROJECT';
        UPDATE permissions SET display_name = 'Delete Projects' where permission = 'DELETE_PROJECT';
        UPDATE permissions SET display_name = 'Update Strategies on Toggles' where permission = 'UPDATE_FEATURE_STRATEGY';
        UPDATE permissions SET display_name = 'Add Strategies to Toggles' where permission = 'CREATE_FEATURE_STRATEGY';
        UPDATE permissions SET display_name = 'Remove Strategies from Toggles' where permission = 'DELETE_FEATURE_STRATEGY';
        UPDATE permissions SET display_name = 'Update Strategies' where permission = 'UPDATE_STRATEGY';
        UPDATE permissions SET display_name = 'Delete Strategies' where permission = 'DELETE_STRATEGY';
        UPDATE permissions SET display_name = 'Enable/Disable Toggles for Environments' where permission = 'UPDATE_FEATURE_ENVIRONMENT';
        UPDATE permissions SET display_name = 'Update Context Fields' where permission = 'UPDATE_CONTEXT_FIELD';
        UPDATE permissions SET display_name = 'Create Context Fields' where permission = 'CREATE_CONTEXT_FIELD';
        UPDATE permissions SET display_name = 'Delete Context Fields' where permission = 'DELETE_CONTEXT_FIELD';
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
