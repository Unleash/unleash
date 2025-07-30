exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE permissions SET display_name = 'Create Backend tokens' WHERE permission = 'CREATE_CLIENT_API_TOKEN';
    UPDATE permissions SET display_name = 'Update Backend tokens' WHERE permission = 'UPDATE_CLIENT_API_TOKEN';
    UPDATE permissions SET display_name = 'Delete Backend tokens' WHERE permission = 'DELETE_CLIENT_API_TOKEN';
    UPDATE permissions SET display_name = 'Read Backend tokens' WHERE permission = 'READ_CLIENT_API_TOKEN';

    UPDATE permissions SET display_name = 'Create Frontend tokens' WHERE permission = 'CREATE_FRONTEND_API_TOKEN';
    UPDATE permissions SET display_name = 'Update Frontend tokens' WHERE permission = 'UPDATE_FRONTEND_API_TOKEN';
    UPDATE permissions SET display_name = 'Delete Frontend tokens' WHERE permission = 'DELETE_FRONTEND_API_TOKEN';
    UPDATE permissions SET display_name = 'Read Frontend tokens' WHERE permission = 'READ_FRONTEND_API_TOKEN';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
