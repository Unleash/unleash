exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS permissions
        (
            id              SERIAL PRIMARY KEY,
            permission      VARCHAR(255) NOT NULL,
            display_name    TEXT,
            type            VARCHAR(255),
            created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        INSERT INTO permissions (permission, display_name, type) VALUES ('ADMIN', 'Admin', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_FEATURE', 'Create Feature Toggles', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_STRATEGY','Create Strategies', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_ADDON', 'Create Addons', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_ADDON', 'Delete Addons', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_ADDON', 'Update Addons', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_FEATURE', 'Update Feature Toggles', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_FEATURE', 'Delete Feature Toggles', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_APPLICATION', 'Update Applications', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_TAG_TYPE', 'Update Tag Types', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_TAG_TYPE', 'Delete Tag Types', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_PROJECT', 'Create Projects', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_PROJECT', 'Update Projects', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_PROJECT', 'Delete Projects', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_STRATEGY', 'Update Strategies', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_STRATEGY', 'Delete Strategies', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_CONTEXT_FIELD', 'Update Context Fields', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_CONTEXT_FIELD', 'Create Context Fields', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_CONTEXT_FIELD', 'Delete Context Fields', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('READ_ROLE', 'Read Roles', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_ROLE', 'Update Roles', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_API_TOKEN', 'Update API Tokens', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_API_TOKEN', 'Create API Tokens', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_API_TOKEN', 'Delete API Tokens', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_FEATURE_STRATEGY', 'Create Feature Strategies', 'environment');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_FEATURE_STRATEGY', 'Update Feature Strategies', 'environment');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_FEATURE_STRATEGY', 'Delete Feature Strategies', 'environment');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_FEATURE_ENVIRONMENT', 'Enable/disable Toggles in Environment', 'environment');
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_FEATURE_VARIANTS', 'Create/Edit variants', 'project');

        ALTER TABLE role_user ADD COLUMN
        project        VARCHAR(255);

        ALTER TABLE roles
        ADD COLUMN
            updated_at  TIMESTAMP WITH TIME ZONE;

        ALTER TABLE role_permission
        ADD COLUMN
            permission_id INTEGER,
        ADD COLUMN
            environment VARCHAR (100);

        CREATE TEMPORARY TABLE temp_primary_roles
        (
            id INTEGER,
            name TEXT,
            description TEXT,
            type TEXT,
            project TEXT,
            created_at DATE
        )
        ON COMMIT DROP;

        CREATE TEMPORARY TABLE temp_discard_roles
        (
            id INTEGER,
            name TEXT,
            description TEXT,
            type TEXT,
            project TEXT,
            created_at DATE
        )
        ON COMMIT DROP;

        INSERT INTO temp_primary_roles select distinct on (name) id, name ,description, type, project, created_at from roles order by name, id;

        INSERT INTO temp_discard_roles SELECT r.id, r.name, r.description, r.type, r.project, r.created_at FROM roles r
        LEFT JOIN temp_primary_roles tpr ON r.id = tpr.id
        WHERE tpr.id IS NULL;

        UPDATE role_user
        SET project = tpr.project
        FROM temp_primary_roles tpr
        WHERE tpr.id = role_user.role_id;

        ALTER TABLE role_user DROP CONSTRAINT role_user_pkey;

        WITH rtu as (
            SELECT tdr.id as old_role_id, tpr.id as new_role_id, tdr.project as project FROM temp_discard_roles tdr
            JOIN temp_primary_roles tpr ON tdr.name = tpr.name
        )
        UPDATE role_user
        SET project = rtu.project, role_id = rtu.new_role_id
        FROM rtu
        WHERE rtu.old_role_id = role_user.role_id;

        UPDATE role_user SET project = '*' WHERE project IS NULL;
        ALTER TABLE role_user ADD PRIMARY KEY (role_id, user_id, project);

        DELETE FROM roles WHERE EXISTS
        (
            SELECT 1 FROM temp_discard_roles tdr WHERE tdr.id = roles.id
        );

        DELETE FROM role_permission;

        ALTER TABLE roles DROP COLUMN project;
        ALTER TABLE role_permission
            DROP COLUMN project,
            DROP COLUMN permission;

        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Editor' LIMIT 1),
            p.id as permission_id,
            '*' as environment
        FROM permissions p
        WHERE p.permission IN
            ('CREATE_STRATEGY',
            'UPDATE_STRATEGY',
            'DELETE_STRATEGY',
            'UPDATE_APPLICATION',
            'CREATE_CONTEXT_FIELD',
            'UPDATE_CONTEXT_FIELD',
            'DELETE_CONTEXT_FIELD',
            'CREATE_PROJECT',
            'CREATE_ADDON',
            'UPDATE_ADDON',
            'DELETE_ADDON',
            'UPDATE_PROJECT',
            'DELETE_PROJECT',
            'CREATE_FEATURE',
            'UPDATE_FEATURE',
            'DELETE_FEATURE',
            'UPDATE_TAG_TYPE',
            'DELETE_TAG_TYPE',
            'UPDATE_FEATURE_VARIANTS');

        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Owner' LIMIT 1),
            p.id as permission_id,
            null as environment
        FROM permissions p
        WHERE p.permission IN
            ('UPDATE_PROJECT',
            'DELETE_PROJECT',
            'CREATE_FEATURE',
            'UPDATE_FEATURE',
            'DELETE_FEATURE',
            'UPDATE_FEATURE_VARIANTS');

        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Member' LIMIT 1),
            p.id as permission_id,
            null as environment
        FROM permissions p
        WHERE p.permission IN
            ('CREATE_FEATURE',
            'UPDATE_FEATURE',
            'DELETE_FEATURE',
            'UPDATE_FEATURE_VARIANTS');

        INSERT INTO role_permission (role_id, permission_id, environment)
        SELECT
            (SELECT id as role_id from roles WHERE name = 'Admin' LIMIT 1),
            p.id as permission_id,
            '*' environment
        FROM permissions p
        WHERE p.permission = 'ADMIN';

        ALTER TABLE role_permission
            ADD CONSTRAINT fk_role_permission
                FOREIGN KEY(role_id)
                REFERENCES roles(id) ON DELETE CASCADE;

        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE role_user DROP COLUMN project;

        ALTER TABLE roles DROP COLUMN updated_at;

        ALTER TABLE role_permission
            DROP COLUMN
                permission_id,
            DROP COLUMN
                environment;

        ALTER TABLE role_permission
            ADD COLUMN project TEXT,
            ADD COLUMN permission TEXT;

        DROP TABLE permissions;
  `,
        cb,
    );
};
