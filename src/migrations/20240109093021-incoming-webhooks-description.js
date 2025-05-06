exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhooks ADD COLUMN IF NOT EXISTS description TEXT;
        `,
        cb,
    );
};

exports.down = function (db, callback) {
    callback();
};
