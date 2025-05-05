export async function up(db, cb) {
    db.runSql(
        `
      ALTER TABLE roles ADD CONSTRAINT unique_name UNIQUE (name);
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
      ALTER TABLE roles DROP CONSTRAINT unique_name;
`,
        cb,
    );
};
