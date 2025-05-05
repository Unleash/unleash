
export async function up(db, cb) {
    db.runSql(
        `
            INSERT INTO environments(name, type, enabled, sort_order)
            VALUES ('development', 'development', true, 100),
                   ('production', 'production', true, 200);
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        DELETE
        FROM environments
        WHERE name IN ('development', 'production');
    `,
        cb,
    );
};
