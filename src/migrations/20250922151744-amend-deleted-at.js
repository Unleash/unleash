
exports.up = (db, callback) => {
    db.runSql(
        `
        UPDATE users
        SET deleted_at = NULL
        WHERE deleted_at IS NOT NULL and length(email) > 0;

        ALTER TABLE users
        ADD CONSTRAINT deleted_at_requires_email_null
        CHECK (deleted_at IS NULL OR email IS NULL);
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        ALTER TABLE users
        DROP CONSTRAINT deleted_at_requires_email_null;
        `,
        callback,
    );
};
