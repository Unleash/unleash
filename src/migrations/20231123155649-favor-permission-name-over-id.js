exports.up = function (db, cb) {
    db.runSql(
        `
-- STEP 1: Ensure 'permission' column contains unique values
ALTER TABLE permissions
ADD CONSTRAINT permission_unique UNIQUE (permission);

-- STEP 2: Add a new column for the new foreign key
ALTER TABLE role_permission
ADD COLUMN permission text;

-- STEP 3: Populate the new column with corresponding values from 'permissions'
UPDATE role_permission rp
SET permission = p.permission
FROM permissions p
WHERE rp.permission_id = p.id;

-- STEP 4: Drop the 'id' primary key constraint
ALTER TABLE permissions
DROP CONSTRAINT permissions_pkey;

-- STEP 5: Add the 'permission' primary key constraint
ALTER TABLE permissions
ADD PRIMARY KEY (permission);

-- STEP 6: Add the new foreign key constraint
ALTER TABLE role_permission
ADD CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission) REFERENCES permissions(permission) ON DELETE CASCADE;

-- STEP 7: Update the assign_unleash_permission_to_role function to use permission name instead of id
CREATE OR REPLACE FUNCTION assign_unleash_permission_to_role(permission_name text, role_name text) returns void as
$$
declare
    var_role_id int;
    var_permission text;
BEGIN
    var_role_id := (SELECT r.id FROM roles r WHERE r.name = role_name);
    var_permission := (SELECT p.permission FROM permissions p WHERE p.permission = permission_name);

    IF NOT EXISTS (
        SELECT 1
        FROM role_permission AS rp
        WHERE rp.role_id = var_role_id AND rp.permission = var_permission
    ) THEN
        INSERT INTO role_permission(role_id, permission) VALUES (var_role_id, var_permission);
    END IF;
END
$$ language plpgsql;

-- STEP 8: Create a new assign_unleash_permission_to_role_for_all_environments function
CREATE OR REPLACE FUNCTION assign_unleash_permission_to_role_for_all_environments(permission_name text, role_name text) returns void as
$$
declare
    var_role_id int;
    var_permission text;
BEGIN
    var_role_id := (SELECT id FROM roles r WHERE r.name = role_name);
    var_permission := (SELECT p.permission FROM permissions p WHERE p.permission = permission_name);

    INSERT INTO role_permission (role_id, permission, environment)
        SELECT var_role_id, var_permission, e.name
        FROM environments e
        WHERE NOT EXISTS (
            SELECT 1
            FROM role_permission rp
            WHERE rp.role_id = var_role_id
            AND rp.permission = var_permission
            AND rp.environment = e.name
        );
END;
$$ LANGUAGE plpgsql;

-- STEP 9: Ensure that all the expected permissions exist
INSERT INTO permissions (permission, display_name, type)
SELECT * FROM (VALUES
    ('ADMIN', 'Admin', 'root'),
    ('CREATE_FEATURE', 'Create feature toggles', 'project'),
    ('CREATE_STRATEGY', 'Create activation strategies', 'root'),
    ('CREATE_ADDON', 'Create addons', 'root'),
    ('DELETE_ADDON', 'Delete addons', 'root'),
    ('UPDATE_ADDON', 'Update addons', 'root'),
    ('UPDATE_FEATURE', 'Update feature toggles', 'project'),
    ('DELETE_FEATURE', 'Delete feature toggles', 'project'),
    ('UPDATE_APPLICATION', 'Update applications', 'root'),
    ('UPDATE_TAG_TYPE', 'Update tag types', 'root'),
    ('DELETE_TAG_TYPE', 'Delete tag types', 'root'),
    ('CREATE_PROJECT', 'Create projects', 'root'),
    ('UPDATE_PROJECT', 'Update project', 'project'),
    ('DELETE_PROJECT', 'Delete project', 'project'),
    ('UPDATE_STRATEGY', 'Update strategies', 'root'),
    ('DELETE_STRATEGY', 'Delete strategies', 'root'),
    ('UPDATE_CONTEXT_FIELD', 'Update context fields', 'root'),
    ('CREATE_CONTEXT_FIELD', 'Create context fields', 'root'),
    ('DELETE_CONTEXT_FIELD', 'Delete context fields', 'root'),
    ('READ_ROLE', 'Read roles', 'root'),
    ('CREATE_FEATURE_STRATEGY', 'Create activation strategies', 'environment'),
    ('UPDATE_FEATURE_STRATEGY', 'Update activation strategies', 'environment'),
    ('DELETE_FEATURE_STRATEGY', 'Delete activation strategies', 'environment'),
    ('CREATE_CLIENT_API_TOKEN', 'Create CLIENT API tokens', 'root'),
    ('UPDATE_FEATURE_VARIANTS', 'Create/edit variants', 'project'),
    ('MOVE_FEATURE_TOGGLE', 'Change feature toggle project', 'project'),
    ('CREATE_SEGMENT', 'Create segments', 'root'),
    ('UPDATE_SEGMENT', 'Edit segments', 'root'),
    ('DELETE_SEGMENT', 'Delete segments', 'root'),
    ('READ_PROJECT_API_TOKEN', 'Read api tokens for a specific project', 'project'),
    ('CREATE_PROJECT_API_TOKEN', 'Create api tokens for a specific project', 'project'),
    ('DELETE_PROJECT_API_TOKEN', 'Delete api tokens for a specific project', 'project'),
    ('UPDATE_FEATURE_ENVIRONMENT_VARIANTS', 'Update variants', 'environment'),
    ('UPDATE_FEATURE_ENVIRONMENT', 'Enable/disable toggles', 'environment'),
    ('APPLY_CHANGE_REQUEST', 'Apply change requests', 'environment'),
    ('UPDATE_CLIENT_API_TOKEN', 'Update CLIENT API tokens', 'root'),
    ('UPDATE_PROJECT_SEGMENT', 'Create/edit project segment', 'project'),
    ('SKIP_CHANGE_REQUEST', 'Skip change request process', 'environment'),
    ('DELETE_CLIENT_API_TOKEN', 'Delete CLIENT API tokens', 'root'),
    ('READ_CLIENT_API_TOKEN', 'Read CLIENT API tokens', 'root'),
    ('APPROVE_CHANGE_REQUEST', 'Approve/Reject change requests', 'environment'),
    ('CREATE_FRONTEND_API_TOKEN', 'Create FRONTEND API tokens', 'root'),
    ('UPDATE_FRONTEND_API_TOKEN', 'Update FRONTEND API tokens', 'root'),
    ('DELETE_FRONTEND_API_TOKEN', 'Delete FRONTEND API tokens', 'root'),
    ('READ_FRONTEND_API_TOKEN', 'Read FRONTEND API tokens', 'root'),
    ('UPDATE_FEATURE_DEPENDENCY', 'Update feature dependency', 'project'),
    ('CREATE_TAG_TYPE', 'Create tag types', 'root')
) AS new_permissions(permission, display_name, type)
WHERE NOT EXISTS (
    SELECT 1 FROM permissions WHERE permission = new_permissions.permission
);

-- STEP 10: Ensure the default roles exist
INSERT INTO roles (name, description, type)
SELECT * FROM (VALUES
    ('Admin', 'Users with the root admin role have superuser access to Unleash and can perform any operation within the Unleash platform.', 'root'),
    ('Editor', 'Users with the root editor role have access to most features in Unleash, but can not manage users and roles in the root scope. Editors will be added as project owners when creating projects and get superuser rights within the context of these projects. Users with the editor role will also get access to most permissions on the default project by default.', 'root'),
	('Viewer', 'Users with the root viewer role can only read root resources in Unleash. Viewers can be added to specific projects as project members. Users with the viewer role may not view API tokens.', 'root'),
    ('Owner', 'Users with the project owner role have full control over the project, and can add and manage other users within the project context, manage feature toggles within the project, and control advanced project features like archiving and deleting the project.', 'project'),
	('Member', 'Users with the project member role are allowed to view, create, and update feature toggles within a project, but have limited permissions in regards to managing the project''s user access and can not archive or delete the project.', 'project')
) AS new_roles(name, description)
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = new_roles.name
);

-- STEP 11: Ensure the default roles have the correct permissions
SELECT assign_unleash_permission_to_role('ADMIN', 'Admin');

SELECT assign_unleash_permission_to_role('CREATE_FEATURE', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_STRATEGY', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_ADDON', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_ADDON', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_ADDON', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_FEATURE', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_APPLICATION', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_TAG_TYPE', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_TAG_TYPE', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_PROJECT', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_PROJECT', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_PROJECT', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_STRATEGY', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_STRATEGY', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_CONTEXT_FIELD', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_CONTEXT_FIELD', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_CONTEXT_FIELD', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_VARIANTS', 'Editor');
SELECT assign_unleash_permission_to_role_for_all_environments('CREATE_FEATURE_STRATEGY', 'Editor');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_STRATEGY', 'Editor');
SELECT assign_unleash_permission_to_role_for_all_environments('DELETE_FEATURE_STRATEGY', 'Editor');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_ENVIRONMENT', 'Editor');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_ENVIRONMENT_VARIANTS', 'Editor');
SELECT assign_unleash_permission_to_role('MOVE_FEATURE_TOGGLE', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_SEGMENT', 'Editor');
SELECT assign_unleash_permission_to_role('UPDATE_SEGMENT', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_SEGMENT', 'Editor');
SELECT assign_unleash_permission_to_role('READ_PROJECT_API_TOKEN', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_PROJECT_API_TOKEN', 'Editor');
SELECT assign_unleash_permission_to_role('DELETE_PROJECT_API_TOKEN', 'Editor');
SELECT assign_unleash_permission_to_role('READ_CLIENT_API_TOKEN', 'Editor');
SELECT assign_unleash_permission_to_role('READ_FRONTEND_API_TOKEN', 'Editor');
SELECT assign_unleash_permission_to_role('CREATE_TAG_TYPE', 'Editor');

SELECT assign_unleash_permission_to_role('CREATE_FEATURE', 'Owner');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE', 'Owner');
SELECT assign_unleash_permission_to_role('DELETE_FEATURE', 'Owner');
SELECT assign_unleash_permission_to_role('UPDATE_PROJECT', 'Owner');
SELECT assign_unleash_permission_to_role('DELETE_PROJECT', 'Owner');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_VARIANTS', 'Owner');
SELECT assign_unleash_permission_to_role_for_all_environments('CREATE_FEATURE_STRATEGY', 'Owner');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_STRATEGY', 'Owner');
SELECT assign_unleash_permission_to_role_for_all_environments('DELETE_FEATURE_STRATEGY', 'Owner');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_ENVIRONMENT', 'Owner');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_ENVIRONMENT_VARIANTS', 'Owner');
SELECT assign_unleash_permission_to_role('MOVE_FEATURE_TOGGLE', 'Owner');
SELECT assign_unleash_permission_to_role('READ_PROJECT_API_TOKEN', 'Owner');
SELECT assign_unleash_permission_to_role('CREATE_PROJECT_API_TOKEN', 'Owner');
SELECT assign_unleash_permission_to_role('DELETE_PROJECT_API_TOKEN', 'Owner');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_DEPENDENCY', 'Owner');

SELECT assign_unleash_permission_to_role('CREATE_FEATURE', 'Member');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE', 'Member');
SELECT assign_unleash_permission_to_role('DELETE_FEATURE', 'Member');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_VARIANTS', 'Member');
SELECT assign_unleash_permission_to_role_for_all_environments('CREATE_FEATURE_STRATEGY', 'Member');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_STRATEGY', 'Member');
SELECT assign_unleash_permission_to_role_for_all_environments('DELETE_FEATURE_STRATEGY', 'Member');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_ENVIRONMENT', 'Member');
SELECT assign_unleash_permission_to_role_for_all_environments('UPDATE_FEATURE_ENVIRONMENT_VARIANTS', 'Member');
SELECT assign_unleash_permission_to_role('READ_PROJECT_API_TOKEN', 'Member');
SELECT assign_unleash_permission_to_role('CREATE_PROJECT_API_TOKEN', 'Member');
SELECT assign_unleash_permission_to_role('DELETE_PROJECT_API_TOKEN', 'Member');
SELECT assign_unleash_permission_to_role('UPDATE_FEATURE_DEPENDENCY', 'Member');
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
-- STEP 1: Undo foreign key constraint on 'role_permission'
ALTER TABLE role_permission
DROP CONSTRAINT fk_role_permission_permission;

-- STEP 2: Undo primary key constraint on 'permissions'
ALTER TABLE permissions
DROP CONSTRAINT permissions_pkey;

-- STEP 3: Add the 'id' primary key constraint
ALTER TABLE permissions
ADD PRIMARY KEY (id);

-- STEP 4: Re-add the permissions by id
UPDATE role_permission rp
SET permission_id = p.id
FROM permissions p
WHERE rp.permission = p.permission;

-- STEP 5: Drop the new 'permission' column
ALTER TABLE role_permission
DROP COLUMN permission;

-- STEP 6: Drop the unique constraint on 'permission'
ALTER TABLE permissions
DROP CONSTRAINT permission_unique;
        `,
        cb
    );
};
