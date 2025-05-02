'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        CREATE INDEX idx_events_type ON events (type);
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_events_type;
        `,
        callback,
    );
};
