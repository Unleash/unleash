'use strict';

export function up(db, callback) {
    db.runSql(
        `DROP INDEX idx_client_metrics_f_name;
         DROP INDEX user_feedback_user_id_idx;
         DROP INDEX user_splash_user_id_idx;
        `,
        callback,
    );
}

export function down(db, callback) {
    db.runSql(
        `CREATE INDEX idx_client_metrics_f_name ON client_metrics_env(feature_name);
         CREATE INDEX user_feedback_user_id_idx ON user_feedback (user_id);
         CREATE INDEX user_splash_user_id_idx ON user_splash (user_id);
        `,
        callback,
    );
}
