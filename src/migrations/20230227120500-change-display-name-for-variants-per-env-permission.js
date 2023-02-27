'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          UPDATE permissions SET display_name='Update variants' WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS';
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          UPDATE permissions SET display_name='Update variants on environment' WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS';
        `,
        callback,
    );
};
