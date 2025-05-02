export async function up(db, cb) {
    db.runSql(
        `
            ALTER TABLE features DROP COLUMN IF EXISTS archived;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            ALTER TABLE features ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
        `,
        cb,
    );
};
