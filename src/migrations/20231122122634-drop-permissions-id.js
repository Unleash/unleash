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

-- STEP 4: Drop the 'id' column
ALTER TABLE permissions
DROP COLUMN id;

-- STEP 5: Add the primary key constraint
ALTER TABLE permissions
ADD PRIMARY KEY (permission);

-- STEP 6: Drop the old foreign key column
ALTER TABLE role_permission
DROP COLUMN permission_id;

-- STEP 7: Add the new foreign key constraint
ALTER TABLE role_permission
ADD CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission) REFERENCES permissions(permission) ON DELETE CASCADE;

-- STEP 8: Ensure that all the expected permissions exist
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

-- STEP 3: Re-add the permissions 'id' column
ALTER TABLE permissions
ADD COLUMN id SERIAL PRIMARY KEY;

-- STEP 4: Re-add the role_permission 'permission_id' column
ALTER TABLE role_permission
ADD COLUMN permission_id INTEGER;

-- STEP 5: Re-add the permissions
UPDATE role_permission rp
SET permission_id = p.id
FROM permissions p
WHERE rp.permission = p.permission;

-- STEP 6: Drop the new 'permission' column
ALTER TABLE role_permission
DROP COLUMN permission;

-- STEP 7: Drop the unique constraint on 'permission'
ALTER TABLE permissions
DROP CONSTRAINT permission_unique;
        `,
        cb
    );
};
