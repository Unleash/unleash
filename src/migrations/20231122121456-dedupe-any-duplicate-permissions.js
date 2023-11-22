exports.up = function (db, cb) {
    db.runSql(
        `
-- STEP 1: Update references in the role_permission table, setting the permission to the lowest ID for each duplicate permission

WITH Duplicates AS (
    SELECT
        MIN(id) AS min_id,
        permission
    FROM
        permissions
    GROUP BY
        permission
    HAVING
        COUNT(*) > 1
)

UPDATE
    role_permission
SET
    permission_id = (SELECT min_id FROM Duplicates WHERE Duplicates.permission = permissions.permission)
FROM
    permissions
WHERE
    role_permission.permission_id = permissions.id
AND
    EXISTS (SELECT 1 FROM Duplicates WHERE Duplicates.permission = permissions.permission);


-- STEP 2: Delete the duplicate permissions, keeping the ones with the lowest ID

WITH Duplicates AS (
    SELECT
        MIN(id) AS min_id,
        permission
    FROM
        permissions
    GROUP BY
        permission
    HAVING
        COUNT(*) > 1
)

DELETE FROM
    permissions
WHERE
    id NOT IN (SELECT min_id FROM Duplicates)
AND
    permission IN (SELECT permission FROM Duplicates);
        `,
        cb
    );
};

exports.down = function (db, callback) {
    callback();
};
