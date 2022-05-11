'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
          UPDATE feature_strategies
          SET project_name = project
          FROM features
          WHERE features.project != feature_strategies.project_name;
        `,
        cb,
    );
};

// This is a fix for a broken state, we don't want this to be rolled back
exports.down = function (db, cb) {
    cb();
};
