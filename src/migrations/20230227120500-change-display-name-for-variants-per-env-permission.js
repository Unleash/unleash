'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          UPDATE permissions SET display_name='Update variants' WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT_VARIANTS';
          UPDATE permissions SET display_name = 'Enable/disable toggles' WHERE permission = 'UPDATE_FEATURE_ENVIRONMENT';
          UPDATE permissions SET display_name = 'Approve change requests' WHERE permission = 'APPROVE_CHANGE_REQUEST';
          UPDATE permissions SET display_name = 'Apply change requests' WHERE permission = 'APPLY_CHANGE_REQUEST';
          UPDATE permissions SET display_name = 'Skip change request process (API-only)' WHERE permission = 'SKIP_CHANGE_REQUEST';
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        `,
        callback,
    );
};
