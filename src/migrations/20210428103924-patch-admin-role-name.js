
export async function up(db, cb) {
    db.runSql(
        `
        UPDATE roles set name='Admin' where name='Super User';
        `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
