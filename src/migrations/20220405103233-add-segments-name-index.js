
export async function up(db, cb) {
    db.runSql(
        `
        create index segments_name_index on segments (name);
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        drop index segments_name_index;
        `,
        cb,
    );
};
