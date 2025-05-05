
export async function up(db, cb) {
    db.runSql(
        `
          ALTER TABLE api_tokens DROP CONSTRAINT api_tokens_environment_fkey;
      `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
          ALTER TABLE api_tokens ADD CONSTRAINT api_tokens_environment_fkey FOREIGN KEY(environment) REFERENCES environments(name) ON DELETE CASCADE;
      `,
        cb,
    );
};
