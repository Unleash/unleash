'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
      CREATE TABLE IF NOT EXISTS user_feedback 
      (user_id INTEGER NOT NULL references users (id), 
      feedback_id TEXT, 
      given TIMESTAMP WITH TIME ZONE, 
      neverShow BOOLEAN NOT NULL DEFAULT false, 
      PRIMARY KEY (user_id, feedback_id));
      CREATE INDEX user_feedback_user_id_idx ON user_feedback (user_id);
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX user_feedback_user_id_idx;
        DROP TABLE user_feedback;
    `,
        cb,
    );
};
