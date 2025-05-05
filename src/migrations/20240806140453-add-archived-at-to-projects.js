
export async function up(db, callback) {
    db.runSql(
        `
        ALTER TABLE projects ADD archived_at TIMESTAMP WITH TIME ZONE;
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        ALTER TABLE projects DROP COLUMN archived_at;
        `,
        callback,
    );
};
