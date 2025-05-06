exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE ai_chats RENAME COLUMN chat TO messages;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE ai_chats RENAME COLUMN messages TO chat;
        `,
        cb,
    );
};
