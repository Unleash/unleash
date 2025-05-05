
export async function up(db, cb) {
    db.runSql(
        `
    UPDATE api_tokens SET environment = 'default' WHERE environment = ':global:';
    UPDATE api_tokens SET environment = 'default' WHERE type='client' AND environment is null;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
  UPDATE api_tokens SET environment = null WHERE type='client' AND environment = 'default';
  `,
        cb,
    );
};
