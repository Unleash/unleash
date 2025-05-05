export async function up(db, cb) {
    db.runSql(
        `
          ALTER TABLE api_tokens ADD COLUMN project VARCHAR REFERENCES PROJECTS(id) ON DELETE CASCADE;; 
          ALTER TABLE api_tokens ADD COLUMN environment VARCHAR REFERENCES environments(name) ON DELETE CASCADE;; 
      `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE api_tokens DROP COLUMN project;
        ALTER TABLE api_tokens DROP COLUMN environment;
        `,
        cb,
    );
};
