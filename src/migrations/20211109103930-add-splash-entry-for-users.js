export async function up(db, cb) {
    db.runSql(
        `INSERT INTO user_splash(splash_id, user_id, seen) SELECT 'environment', u.id, false FROM users u`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('DELETE FROM user_splash', cb);
};
