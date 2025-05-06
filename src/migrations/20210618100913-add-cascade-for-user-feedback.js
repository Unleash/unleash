exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE user_feedback DROP CONSTRAINT user_feedback_user_id_fkey;
    ALTER TABLE user_feedback 
        ADD CONSTRAINT user_feedback_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('', cb);
};
