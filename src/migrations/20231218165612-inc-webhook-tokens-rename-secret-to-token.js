exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhook_tokens RENAME COLUMN secret TO token;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhook_tokens RENAME COLUMN token TO secret;
        `,
        cb,
    );
};
