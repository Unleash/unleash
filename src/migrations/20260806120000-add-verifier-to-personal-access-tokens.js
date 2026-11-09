'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE personal_access_tokens
            ALTER COLUMN secret DROP NOT NULL,
            ADD COLUMN selector TEXT UNIQUE,
            ADD COLUMN verifier TEXT,
            ADD CONSTRAINT personal_access_tokens_credential_shape CHECK (
                (secret IS NOT NULL AND selector IS NULL AND verifier IS NULL)
                OR
                (secret IS NULL AND selector IS NOT NULL AND verifier IS NOT NULL)
            );
            -- Keep legacy token lookups indexed. This index was removed when
            -- the primary key changed from secret to id.
            CREATE INDEX personal_access_tokens_secret_idx
                ON personal_access_tokens (secret);
            -- PostgreSQL does not create indexes for foreign key columns. This
            -- supports the per-user PAT list/count/delete queries and user deletion.
            CREATE INDEX personal_access_tokens_user_id_idx
                ON personal_access_tokens (user_id);`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `DELETE FROM personal_access_tokens WHERE secret IS NULL;
         DROP INDEX personal_access_tokens_user_id_idx;
         DROP INDEX personal_access_tokens_secret_idx;
         ALTER TABLE personal_access_tokens
            DROP CONSTRAINT personal_access_tokens_credential_shape,
            DROP COLUMN selector,
            DROP COLUMN verifier,
            ALTER COLUMN secret SET NOT NULL;`,
        cb,
    );
};
