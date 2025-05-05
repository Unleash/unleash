
export async function up(db, callback) {
    db.runSql(
        'ALTER TABLE projects ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();',
        callback,
    );
};

export async function down(db, callback) {
    db.runSql('ALTER TABLE projects DROP COLUMN "updated_at";', callback);
};
