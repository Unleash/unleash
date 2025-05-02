export async function up(db, cb) {
    db.runSql(
        `
  UPDATE role_permission SET environment = '' where permission_id NOT IN 
    (select id from permissions WHERE type = 'environment');
`,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
