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
    permission_id = d.min_id
FROM
    Duplicates d
JOIN
    permissions p ON d.permission = p.permission
WHERE
    role_permission.permission_id = p.id
AND
    role_permission.permission_id != d.min_id;


-- STEP 2: Delete redundant role_permission entries

DELETE FROM role_permission
WHERE ctid IN (
    SELECT ctid
    FROM (
        SELECT ctid, ROW_NUMBER() OVER (PARTITION BY role_id, permission_id, environment ORDER BY created_at) as rn
        FROM role_permission
    ) t
    WHERE t.rn > 1
);

-- STEP 3: Delete the duplicate permissions, keeping the ones with the lowest ID

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

DELETE FROM permissions
WHERE id NOT IN (
    SELECT min_id FROM Duplicates
)
AND permission IN (
    SELECT permission FROM Duplicates
);
        `,
        cb
    );
};

exports.down = function (db, callback) {
    callback();
};
