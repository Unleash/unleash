exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE users
            ADD COLUMN IF NOT EXISTS company_role TEXT,
            ADD COLUMN IF NOT EXISTS product_updates_email_consent BOOLEAN;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE users
            DROP COLUMN IF EXISTS company_role,
            DROP COLUMN IF EXISTS product_updates_email_consent;`,
        cb,
    );
};
