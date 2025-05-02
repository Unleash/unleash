export async function up(db, cb) {
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

export async function down(db, cb) {
    db.runSql('', cb);
};
