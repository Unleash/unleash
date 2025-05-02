export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE action_sets ADD COLUMN enabled BOOLEAN DEFAULT true;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE action_sets DROP COLUMN enabled;
        `,
        cb,
    );
};
