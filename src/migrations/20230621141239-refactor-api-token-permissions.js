exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE permissions SET display_name = 'Create CLIENT API tokens' WHERE permission = 'CREATE_CLIENT_API_TOKEN';
    UPDATE permissions SET display_name = 'Update CLIENT API tokens' WHERE permission = 'UPDATE_CLIENT_API_TOKEN';
    UPDATE permissions SET display_name = 'Delete CLIENT API tokens' WHERE permission = 'DELETE_CLIENT_API_TOKEN';
    UPDATE permissions SET display_name = 'Read CLIENT API tokens' WHERE permission = 'READ_CLIENT_API_TOKEN';

    UPDATE permissions SET display_name = 'Create FRONTEND API tokens' WHERE permission = 'CREATE_FRONTEND_API_TOKEN';
    UPDATE permissions SET display_name = 'Update FRONTEND API tokens' WHERE permission = 'UPDATE_FRONTEND_API_TOKEN';
    UPDATE permissions SET display_name = 'Delete FRONTEND API tokens' WHERE permission = 'DELETE_FRONTEND_API_TOKEN';
    UPDATE permissions SET display_name = 'Read FRONTEND API tokens' WHERE permission = 'READ_FRONTEND_API_TOKEN';
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
