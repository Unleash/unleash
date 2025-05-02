'use strict';

export async function up(db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_events
                DROP CONSTRAINT change_request_events_feature_action_change_request_id_key
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_events
                ADD CONSTRAINT change_request_events_feature_action_change_request_id_key
                    UNIQUE (feature, action, change_request_id);
        `,
        callback,
    );
};
