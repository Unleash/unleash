
export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE features ADD COLUMN "impression_data" BOOLEAN DEFAULT FALSE;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE features DROP COLUMN "impression_data";
        `,
        cb,
    );
};
