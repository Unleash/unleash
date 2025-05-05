
export async function up(db, cb) {
    db.runSql(
        `
    ALTER TABLE features ALTER COLUMN archived DROP DEFAULT;
    ALTER TABLE features ALTER COLUMN archived TYPE bool USING case when archived = 0 then false else true end;
    ALTER TABLE features ALTER COLUMN archived SET DEFAULT false;
  `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
    ALTER TABLE features ALTER COLUMN archived DROP DEFAULT;
    ALTER TABLE features ALTER COLUMN archived TYPE integer USING case when archived = true then 1 else 0 end;
    ALTER TABLE features ALTER COLUMN archived SET DEFAULT 0;
  `,
        cb,
    );
};
