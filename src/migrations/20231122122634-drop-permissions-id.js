exports.up = function (db, cb) {
    db.runSql(
        `
-- STEP 1: Ensure 'permission' column contains unique values
ALTER TABLE permissions
ADD CONSTRAINT permission_unique UNIQUE (permission);

-- STEP 2: Add the primary key constraint
ALTER TABLE permissions
ADD PRIMARY KEY (permission);

-- STEP 3: Add a new column for the new foreign key
ALTER TABLE role_permission
ADD COLUMN permission text;

-- STEP 4: Populate the new column with corresponding values from 'permissions'
UPDATE role_permission rp
SET permission = p.permission
FROM permissions p
WHERE rp.permission_id = p.id;

-- STEP 5: Drop the 'id' column
ALTER TABLE permissions
DROP COLUMN id;

-- STEP 6: Drop the old foreign key column
ALTER TABLE role_permission
DROP COLUMN permission_id;

-- STEP 7: Add the new foreign key constraint
ALTER TABLE role_permission
ADD CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission) REFERENCES permissions(permission) ON DELETE CASCADE;
        `,
        cb
    );
};

exports.down = function (db, callback) {
    callback();
};
