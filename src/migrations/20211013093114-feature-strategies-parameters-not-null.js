'use strict';

export async function up(db, cb) {
    db.runSql(
        `
          ALTER TABLE feature_strategies ALTER COLUMN parameters SET DEFAULT '{}';
          UPDATE feature_strategies set parameters = '{}' where parameters is null;
          ALTER TABLE feature_strategies ALTER COLUMN parameters SET NOT NULL;
          `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
