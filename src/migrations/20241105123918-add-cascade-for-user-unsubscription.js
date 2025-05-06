exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE user_unsubscription DROP CONSTRAINT user_unsubscription_user_id_fkey;
    ALTER TABLE user_unsubscription
        ADD CONSTRAINT user_unsubscription_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE;
`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('', cb);
};
