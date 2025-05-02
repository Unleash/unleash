'use strict';

export async function up(db, cb) {
    db.runSql(
        `
            DELETE FROM onboarding_events_instance;
            DELETE FROM onboarding_events_project;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        ``,
        cb);
};
