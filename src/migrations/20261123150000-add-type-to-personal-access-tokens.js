exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE personal_access_tokens
            ADD COLUMN type TEXT
                CONSTRAINT personal_access_tokens_type_valid
                CHECK (type IN ('personal', 'service-account', 'mcp'));
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE personal_access_tokens DROP COLUMN type;
        `,
        cb,
    );
};
