
export async function up(db, callback) {
    db.runSql(
        `UPDATE users SET email = NULL WHERE id = -1337;`,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `UPDATE users SET email = 'system@getunleash.io' WHERE id = -1337;`,
        callback,
    );
};
