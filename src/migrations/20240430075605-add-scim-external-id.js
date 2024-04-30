exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE users ADD COLUMN scim_external_id TEXT;
        ALTER TABLE groups ADD COLUMN scim_external_id TEXT;
        CREATE UNIQUE INDEX users_scim_external_id_uniq_idx on users(scim_external_id) WHERE scim_external_id IS NOT NULL;
        CREATE UNIQUE INDEX groups_scim_external_id_uniq_idx ON groups(scim_external_id) WHERE scim_external_id IS NOT NULL;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    DROP INDEX IF EXISTS users_scim_external_id_uniq_idx;
    DROP INDEX IF EXISTS groups_scim_external_id_uniq_idx;
    ALTER TABLE groups DROP COLUMN scim_external_id;
    ALTER TABLE users DROP COLUMN scim_external_id;
  `,
        cb,
    );
};
