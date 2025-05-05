export async function up(db, callback) {
    db.runSql(
        'ALTER TABLE features ADD "last_seen_at" TIMESTAMP WITH TIME ZONE;',
        callback,
    );
};

export async function down(db, cb) {
    return db.removeColumn('features', 'last_seen_at', cb);
};
