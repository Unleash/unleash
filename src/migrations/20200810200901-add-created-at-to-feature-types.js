
export async function up(db, callback) {
    db.runSql(
        'ALTER TABLE feature_types ADD "created_at" TIMESTAMP WITH TIME ZONE default now();',
        callback,
    );
};

export async function down(db, callback) {
    db.runSql('ALTER TABLE feature_types DROP COLUMN "created_at";', callback);
};
